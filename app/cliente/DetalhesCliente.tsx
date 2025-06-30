import colors from '@/src/colors';
import { database } from '@/src/firebaseConfig';
import FormButton from '@/src/FormButton';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { arrayUnion, deleteDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useClientes } from '../../src/screens/functions/ClientesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function DetalhesCliente({ route, navigation }: any) {
  const { cliente } = route.params;
  const { atualizarAtendimento } = useClientes();
  const c = cliente.atendimento
  const [atendimento, setAtendimento] = useState(cliente.statusProc ?? false);
  const [valor, setValor] = useState();
  const [observacoes, setObservacoes] = useState('');
  const [atendimentoIniciado, setAtendimentoIniciado] = useState(false);
  const [mapping, setMapping] = useState('');
  const [modalShown, setModalShown] = useState(false);
  const { carregarClientes, limparClientes } = useClientes();

  useEffect(() => {}, []);

  function checkFrequencia (cliente) {
    const agora = Timestamp.now();
    const quatroMesesAtras = Timestamp.fromMillis(agora.toMillis() - 4 * 30 * 24 * 60 * 60 * 1000);
    const datas = cliente.historico.map(item => item.data).sort((a, b) => b.seconds - a.seconds);
    if (datas.length >= 3 && datas[0].seconds > quatroMesesAtras.seconds) {
      return true;
    }

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

  const atualizarProc = async (proc) => {
    const auth = getAuth();
    const user = auth.currentUser;
    setAtendimento(proc);

    if (user) {
      const docRef = doc(database, 'user', user.uid, 'Clientes', cliente.id);
      await updateDoc(docRef, {
        statusProc: proc
      });
      if(proc == false) {
        await updateDoc(docRef, {
          historico: arrayUnion({
            id: Math.random().toString(36).substr(2, 9),
            data: Timestamp.now(),
            mapping: mapping,
            valor: valor,
            observacoes: observacoes || null,
            foto: "https://www.rastelliparis.com.br/cdn/shop/files/259F7269-2915-4F81-B903-B4C3AB1C2E51.jpg?v=1721635769&width=1445"
          })
        });
      }
    }
    return await getInfo();
  }

  const excluirCliente = async () => {
    const user = getAuth().currentUser;
    try{
      await deleteDoc(doc(database, 'user', user.uid, 'Clientes', cliente.id));
      Toast.show({
        type: 'info',
        text1: 'Cliente excluido com sucesso!',
        position: 'bottom'
      })
      limparClientes()
      await carregarClientes()

      navigation.reset({
        index: 0,
        routes: [{ name: 'Tabs' }]
      })
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
    }}

    useEffect(() => {
      const carregarDadosPendentes = async () => {
        const dadosSalvos = await AsyncStorage.getItem(`pendente_${cliente.id}`);
        if (dadosSalvos) {
          const { mapping, valor, observacoes } = JSON.parse(dadosSalvos);
          setMapping(mapping);
          setValor(valor);
          setObservacoes(observacoes);
        }
      };
      carregarDadosPendentes();
    }, []);

    useEffect(() => {
      AsyncStorage.setItem(
        `pendente_${cliente.id}`,
        JSON.stringify({ mapping, valor, observacoes })
      );
    }, [mapping, valor, observacoes]);
    

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FFF2F5', paddingHorizontal: 20}}>
      <View style={{alignItems: 'center', marginTop: 20, display: 'flex', flexDirection: 'row', gap: 20, justifyContent: 'center'}}>
        <Image source={{uri: cliente.foto}} style={styles.image}/>
        <View style={{gap: 10, alignItems: 'center'}}>
          <Text style={{fontSize: 24, color: colors.primary, fontWeight: 'bold'}}>{cliente.name}</Text>
          <TouchableOpacity onPress={() => {
            Linking.openURL(`https://wa.me/${cliente.telefone}`);
          }}>
            <Text style={{fontSize: 18, color: colors.title, textDecorationLine: 'underline', fontWeight: 'bold'}}>{cliente.telefone}</Text>
          </TouchableOpacity>
          {atendimento ? (
            <Text style={{fontSize: 10, color: colors.success, fontWeight: 'bold'}}>Atendimento em andamento</Text>
          ): <Text style={{fontSize: 10, color: colors.success, fontWeight: 'bold'}}></Text>}
        </View>
      </View>

      <View style={{backgroundColor: colors.cardBackground, padding: 20, borderRadius: 10, marginTop: 20}}> 
        <Text style={{fontSize: 18, color: colors.title, fontWeight: 'bold', paddingBottom: 10}}>Ultimos atendimentos:</Text>
        <ScrollView style={{borderTopColor: colors.secondary, borderTopWidth: 1, maxHeight: 300}}
        showsVerticalScrollIndicator={true} horizontal={false}
        >
          {cliente.historico.map((item, index) => (
            <TouchableOpacity onPress={() => {
              navigation.navigate('DetalhesMapping', { item, clienteId: cliente.id });
            }} 
            key={index} style={{borderBottomColor: colors.secondary, borderBottomWidth: 1, padding: 10}}>
              <Text style={{color: colors.title, fontWeight: 'bold', fontSize: 16}}>Mapping: {item.mapping}</Text>
              <Text style={{color: colors.secondary}}>Valor: {item.valor}</Text>
              <Text style={{color: colors.secondary}}>Data: {item.data.toDate().toLocaleDateString()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={{display: 'flex', flexDirection: 'row', gap: 10, marginTop: 20}}>
      <FormButton
  title={atendimento ? 'Encerrar atendimento' : 'Iniciar atendimento'}
  onPress={() => {
    const novoStatus = !atendimento;
    if (novoStatus) {
      setModalShown(true); // abrir modal ao iniciar
    }
    setAtendimento(novoStatus); // atualiza localmente
    atualizarProc(novoStatus);
  }}
/>
      <FormButton title="Excluir cliente" onPress={excluirCliente} secondary={true}/>
      </View>

      {modalShown && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalShown}
          onRequestClose={() => {
            setModalShown(false);
          }}
        >
          <View style={{padding: 20, flex: 1, justifyContent: 'center'}}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Preencha as informações</Text>
              <TextInput placeholder='Mapping' value={mapping} onChangeText={setMapping} style={styles.modalInput}/>
              <TextInput placeholder='Valor' value={valor} onChangeText={setValor} style={styles.modalInput} keyboardType="numeric"/>
              <TextInput placeholder='Observacoes' value={observacoes} onChangeText={setObservacoes} style={styles.modalInput}/>
              <FormButton
                title="Salvar atendimento"
                onPress={() => {
                  if (!mapping || !valor) {
                    Alert.alert('Erro', 'Preencha o mapeamento e o valor.');
                    return;
                  }
                
                  setModalShown(false);
                  atualizarProc(true);
                  AsyncStorage.removeItem(`pendente_${cliente.id}`); // limpa os dados temporários
                }}                
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', padding: 20, backgroundColor: '#FFF2F5'},
  image: { width: 180, height: 180, borderRadius: 100, marginBottom: 5, borderWidth: 3, borderColor: colors.title},
  nome: { fontSize: 24, fontWeight: 'bold' }
});
