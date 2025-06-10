import React, { useEffect, useState, useRef } from 'react';
import { format, set } from 'date-fns';
import { View, Text, Image, StyleSheet, Linking, TouchableOpacity, Alert, Platform, Modal, TextInput, Button, ScrollView } from 'react-native';
import { useClientes } from '../../src/screens/functions/ClientesContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

export default function DetalhesCliente({ route, navigation }: any) {
  const { cliente } = route.params;
  const { atualizarAtendimento } = useClientes();
  const c = cliente.atendimento
  const [atendimento, setAtendimento] = useState(c);
  const [valor, setValor] = useState();
  const [observacoes, setObservacoes] = useState('');
  const [atendimentoIniciado, setAtendimentoIniciado] = useState(false);
  const [mapping, setMapping] = useState('');
  const [modalShown, setModalShown] = useState(false);

  useEffect(() => {}, []);

  const gerarRecibo = (cliente, valor) => {
    if (cliente.atendimento) {
      Alert.alert('Atenção', 'O cliente está em atendimento, impossível gerar recibo!');
      return null;
    }
    return {
      nome: cliente.nome,
      procedimento: cliente.procedimento,
      data: new Date().toLocaleDateString(),
      valor: `R$ ${valor.toFixed(2)}`,
      id: cliente.id,
    };
  };

  const gerarReciboPDF = async (cliente, valor) => {
    const recibo = gerarRecibo(cliente, valor);
    if (!recibo) return;

    const html = `
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background-color: #f9f9f9;
          }
          .recibo-container {
            max-width: 600px;
            margin: auto;
            background: #fff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border: 1px solid #ddd;
          }
          h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
            border-bottom: 2px solid #f0c0d0;
            padding-bottom: 10px;
          }
          p {
            font-size: 18px;
            margin: 15px 0;
            color: #444;
          }
          .info-label {
            font-weight: bold;
            color: #111;
          }
          .assinatura {
            margin-top: 50px;
            text-align: right;
            font-style: italic;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="recibo-container">
          <h1>Recibo de Pagamento</h1>
          <p><span class="info-label">Nome:</span> ${recibo.nome}</p>
          <p><span class="info-label">Procedimento:</span> ${recibo.procedimento}</p>
          <p><span class="info-label">Data:</span> ${recibo.data}</p>
          <p><span class="info-label">Valor:</span> ${recibo.valor}</p>
        </div>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS === 'ios') {
        Alert.alert('Recibo gerado', `Recibo salvo em:\n${uri}`);
      }
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao gerar ou compartilhar o PDF');
      console.error(error);
    }
  };

  function checkFrequencia (cliente) {
    const agora = new Date();
    const quatroMesesAtras = new Date();
    quatroMesesAtras.setMonth(agora.getMonth() - 4);
    
    const ocorrencias = cliente.historico.filter(c => {
      const data = new Date(c.data);
      return data >= quatroMesesAtras && data <= agora;
    })

    return ocorrencias.length >= 3
  }

  const [imagem, setImagem] = useState(cliente.foto);

  const tirarFoto = async () => {
  const permissao = await ImagePicker.requestCameraPermissionsAsync();
  if (!permissao.granted) {
    Alert.alert('Permissão negada', 'Você precisa permitir acesso à câmera.');
    return;
  }

  const resultado = await ImagePicker.launchCameraAsync({
    quality: 1,
  });

  if (!resultado.canceled) {
    const uri = resultado.assets[0].uri;
    setImagem(uri);
    atualizarFoto(cliente.id, uri); // atualiza a imagem no contexto
  }
};

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
        <Image source={{ uri: imagem }} style={styles.image} />

        {checkFrequencia(cliente) ? 
        <View style={{flexDirection: 'column', alignItems: 'center'}}>
        <Text style={[styles.nome, {color: '#C28840', fontWeight: 'bold'}]}>{cliente.nome}</Text> 
        <Text>Cliente fiel</Text>
        </View>
        : <Text style={styles.nome}>{cliente.nome}</Text>}

        </View>
        <View style={styles.info}>
        <Text style={styles.texto}>Procedimento: {cliente.procedimento}</Text>
        <Text style={styles.texto}>Data de Nascimento: {cliente.dataNasc || 'Não informada'}</Text>
        <Text style={styles.texto}>
          Data do último procedimento: {format(new Date(cliente.dataUltimoProcedimento), 'dd/MM/yyyy')}
        </Text>
        <Text
          style={[styles.texto, styles.telefone]}
          onPress={() => Linking.openURL(`https://wa.me/${cliente.telefone}`)}
        >
          Telefone: {cliente.telefone}
        </Text>
        </View>

        <View style={styles.list}>
          <Text style={styles.tituloList}>Últimos atendimentos:</Text>
          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            {Array.isArray(cliente.historico) && cliente.historico.map((item) => (
              <View key={item.id} style={styles.itemLista}>
                <Text style={styles.itemTexto}>{item.procedimento}</Text>
                <Text style={styles.itemData}>{format(new Date(item.data), 'dd/MM/yyyy')}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <Button title='AI para mapping' style={styles.button} onPress={() => navigation.navigate('Mapping', { cliente })}/>


        <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: atendimento ? 'green' : 'red' }]}
          onPress={() => {
            const novoStatus = !atendimento;
            setAtendimento(novoStatus);

            if(novoStatus) {
              setModalShown(true);
            }else{
            atualizarAtendimento(cliente.id, novoStatus, new Date(), valor, mapping, observacoes);}
          }}
        >
          <Text style={styles.buttonText}>{!atendimento ? 'Fora de atendimento' : 'Em atendimento'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4a90e2' }]}
          onPress={() => {
            if (!atendimento) {
              if (!valor || isNaN(parseFloat(valor))) {
                Alert.alert('Erro', 'Preencha um valor válido antes de gerar o recibo');
                return;
              }
              gerarReciboPDF(cliente, parseFloat(valor));
            } else {
              Alert.alert('Atenção', 'O cliente está em atendimento, impossível gerar recibo!');
            }
          }}
        >
          <Text style={styles.buttonText}>Gerar Recibo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#4a90e2' }]} onPress={tirarFoto}><Text style={styles.buttonText}>Foto</Text></TouchableOpacity>
        </View>

        <Modal visible={modalShown} animationType='slide'>
          <View style={styles.modalContainer}>
            <Text>Mapping: </Text>
            <TextInput placeholder='Gatinho...' value={mapping} onChangeText={setMapping} />
            <Text>Valor</Text>
            <TextInput placeholder='Ex: R$ 100' value={valor} onChangeText={setValor} keyboardType='numeric' />
            <Text>Observação</Text>
            <TextInput placeholder='Observação...' value={observacoes} onChangeText={setObservacoes} />
            <Button title="Enviar" onPress={() => {
              setModalShown(false);
              atualizarAtendimento(cliente.id, atendimento, new Date(), valor, mapping, observacoes);
            }} />
          </View>
        </Modal>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', padding: 20, backgroundColor: '#FFF2F5' },
  image: { width: 180, height: 180, borderRadius: 100, marginBottom: 20 },
  nome: { fontSize: 24, fontWeight: 'bold' },
  texto: { fontSize: 18, marginTop: 10 },
  telefone: { color: 'blue', textDecorationLine: 'underline', marginTop: 10 },
  button: {
    padding: 12,
    borderRadius: 20,
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
    marginTop: 25,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    height: '32%',
    width: '100%',
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 3,
  },
  scrollList: {
    maxHeight: '100%',
  },
  tituloList: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemLista: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemTexto: {
    fontSize: 16,
  },
  itemData: {
    fontSize: 14,
    color: 'gray',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  info: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    gap: 10
  }
});
