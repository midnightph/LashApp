import colors from '@/src/colors';
import { database } from '@/src/firebaseConfig';
import FormButton from '@/src/FormButton';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { arrayUnion, deleteDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useClientes } from '../../src/screens/functions/ClientesContext';


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

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FFF2F5', paddingHorizontal: 20}}>
      <View style={{alignItems: 'center', marginTop: 20, display: 'flex', flexDirection: 'row', gap: 20}}>
        <Image source={{uri: cliente.foto}} style={styles.image}/>
        <View style={{gap: 10, alignItems: 'center'}}>
          <Text style={{fontSize: 24, color: colors.primary, fontWeight: 'bold'}}>{cliente.name}</Text>
          <TouchableOpacity onPress={() => {
            Linking.openURL(`https://wa.me/${cliente.telefone}`);
          }}>
            <Text style={{fontSize: 18, color: colors.title, textDecorationLine: 'underline', fontWeight: 'bold'}}>{cliente.telefone}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{backgroundColor: colors.cardBackground, padding: 20, borderRadius: 10, marginTop: 20}}> 
        <Text style={{fontSize: 18, color: colors.title, fontWeight: 'bold'}}>Ultimos atendimentos:</Text>
        <View style={{borderTopColor: colors.secondary, borderTopWidth: 1}}>
          {cliente.historico.map((item, index) => (
            <View key={index} style={{borderBottomColor: colors.secondary, borderBottomWidth: 1, padding: 10}}>
              <Text>Mapping: {item.mapping}</Text>
              <Text>Valor: {item.valor}</Text>
              <Text>Observacoes: {item.observacoes}</Text>
              <Text>Data: {item.data.toDate().toLocaleDateString()}</Text>
            </View>
          ))}
        </View>
      </View>

      <FormButton title="Abrir atendimento" onPress={() => {
        atualizarProc(!atendimento)
        console.log(atendimento)
        if(atendimento) {
          setModalShown(true);
        }
      }}/>

      {modalShown && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalShown}
          onRequestClose={() => {
            setModalShown(false);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Atendimento fechado!</Text>
              <FormButton title="Fechar" onPress={() => setModalShown(false)}/>
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
