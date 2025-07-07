import colors from '@/src/colors';
import { database, getHistoricoUsuario, uploadImagem } from '@/src/firebaseConfig';
import FormButton from '@/src/FormButton';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, Timestamp, updateDoc } from 'firebase/firestore';
import { deleteObject, getStorage, listAll, ref } from 'firebase/storage';
import { MotiView } from 'moti';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, ImageBackground, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useClientes } from '../../src/screens/functions/ClientesContext';
import { gerarReciboPDF } from '../../src/screens/functions/gerarRecibo';

export default function DetalhesCliente({ route, navigation }: any) {
  const { cliente } = route.params;
  const { atualizarAtendimento } = useClientes();
  const [atendimento, setAtendimento] = useState(cliente.statusProc ?? false);
  const [valor, setValor] = useState();
  const [observacoes, setObservacoes] = useState('');
  const [mapping, setMapping] = useState('');
  const [modalShown, setModalShown] = useState(false);
  const { carregarClientes, limparClientes } = useClientes();
  const [imagem, setImagem] = useState(cliente.foto);
  const [historicoComId, setHistoricoComId] = useState([]);

  useEffect(() => {
    async function fetchHistoricoComId() {
      try {
        const historico = await getHistoricoUsuario(cliente.id);
        setHistoricoComId(historico);
      } catch (e) {
        console.error('Erro ao buscar histórico:', e);
      }
    }
    fetchHistoricoComId();
  }, []);

  const tirarFoto = async () => {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão negada', 'Você precisa permitir acesso à câmera.');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({ quality: 0.4, base64: false });

    if (!resultado.canceled) {
      const uri = resultado.assets[0].uri;
      const urlFirebase = await uploadImagem(uri, cliente.id);
      await updateDoc(doc(database, 'user', getAuth().currentUser.uid, 'Clientes', cliente.id), { foto: urlFirebase });
      setImagem(urlFirebase);
    }

    navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
  };

  const atualizarProc = async (proc) => {
  const auth = getAuth();
  const user = auth.currentUser;

  const novoHistorico = {
    data: Timestamp.now(),
    mapping: mapping,
    observacoes: observacoes,
    valor: valor,
    foto: 'https://www.rastelliparis.com.br/cdn/shop/files/259F7269-2915-4F81-B903-B4C3AB1C2E51.jpg?v=1721635769&width=1445'
  };
  if(!proc) {
    return await updateDoc(doc(database, 'user', user.uid, 'Clientes', cliente.id), { statusProc: proc });
  }
  try {
    await addDoc(collection(database, 'user', user.uid, 'Clientes', cliente.id, 'Historico'), novoHistorico);
    await updateDoc(doc(database, 'user', user.uid, 'Clientes', cliente.id), { statusProc: proc });
    Toast.show({ type: 'info', text1: 'Procedimento atualizado com sucesso!', position: 'bottom' });
    limparClientes();
    navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
  } catch (error) {
    console.error('Erro ao atualizar procedimento:', error);
  }
};

const excluirCliente = async () => {
  const user = getAuth().currentUser;
  const storage = getStorage();
  const pastaCliente = `clientes/${cliente.id}/`; // exemplo de diretório
  const storageRef = ref(storage, pastaCliente);

  try {
    // Lista todos os arquivos da pasta
    const result = await listAll(storageRef);

    // Deleta cada arquivo encontrado
    const promises = result.items.map((itemRef) => deleteObject(itemRef));
    await Promise.all(promises);

    // Exclui o documento no Firestore
    const historicoRef = collection(database, 'user', user.uid, 'Clientes', cliente.id, 'Historico');
    const querySnapshot = await getDocs(historicoRef);
    const promisesHistorico = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(promisesHistorico);
    await deleteDoc(doc(database, 'user', user.uid, 'Clientes', cliente.id));
    

    Toast.show({ type: 'info', text1: 'Cliente excluído com sucesso!', position: 'bottom' });
    limparClientes();
    navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
  } catch (error) {
    console.error('Erro ao excluir cliente e imagens:', error);
  }
};


  const [inputFocused, setInputFocused] = useState(false);
  const [inputFocused2, setInputFocused2] = useState(false);
  const [inputFocused3, setInputFocused3] = useState(false);
  const valorRef = useRef<TextInput>(null);
  const observacoesRef = useRef<TextInput>(null);

  return (
    <ImageBackground source={require('../images/background.png')} style={{flex: 1}}>
    <SafeAreaView style={{flex: 1, paddingHorizontal: 20}}>
      <MotiView style={{alignItems: 'center', marginTop: 20, flexDirection: 'row', gap: 20, justifyContent: 'center'}} 
        from={{opacity: 0, scale: 0.5, translateY: 50}}
        animate={{opacity: 1, scale: 1, translateY: 0}}
        transition={{type: 'timing', duration: 500}}>
        <Image source={{uri: imagem}} style={styles.image}/>
        <View style={{flexDirection: 'column', gap: 10}}>
          <Text style={{fontSize: 24, color: colors.primary, fontWeight: 'bold', maxWidth: 150}}>{cliente.name.split(' ').slice(0, 2).join(' ')}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${cliente.telefone}`)}>
            <Text style={{fontSize: 18, color: colors.title, textDecorationLine: 'underline', fontWeight: 'bold'}}>{cliente.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}</Text>
          </TouchableOpacity>
          {atendimento && (
            <Text style={{fontSize: 10, color: colors.success, fontWeight: 'bold'}}>Atendimento em andamento</Text>
          )}
        </View>
      </MotiView>

      <View style={{backgroundColor: colors.cardBackground, padding: 20, borderRadius: 10, marginTop: 20}}>
        <Text style={{fontSize: 18, color: colors.title, fontWeight: 'bold', paddingBottom: 10}}>Últimos atendimentos:</Text>
        <ScrollView style={{borderTopColor: colors.primary, borderTopWidth: 1, maxHeight: 300}}>
          {historicoComId.map((item, index) => (
            <TouchableOpacity onPress={() => navigation.navigate('DetalhesMapping', { item, clienteId: cliente.id, id: item.id })} key={item.id} style={{borderBottomColor: colors.primary, borderBottomWidth: 1, padding: 10}}>
              <Text style={{color: colors.title, fontWeight: 'bold', fontSize: 16}}>Mapping: {item.mapping}</Text>
              <Text style={{color: colors.secondary}}>Valor: {item.valor}</Text>
              <Text style={{color: colors.secondary}}>Data: {item.data?.toDate().toLocaleDateString()}</Text>
              <Text style={{color: colors.secondary}}>Observações: {item.observacoes || 'Nenhuma observação'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={{flexDirection: 'row', gap: 10, marginTop: 20, justifyContent: 'center'}}>
        <FormButton
          title={atendimento ? 'Encerrar atendimento' : 'Iniciar atendimento'}
          onPress={() => {
            if (!atendimento) {
              setAtendimento(true);
              setModalShown(true);
            } else {
              setAtendimento(false);
              atualizarProc(false);
            }
          }}
          secondary={!atendimento}
          maxWidth={170}
        />
        <FormButton title="Excluir cliente" onPress={() => {
          Alert.alert('Excluir Cliente', 'Tem certeza que deseja excluir esse cliente?', [
            { text: 'Não', style: 'cancel' },
            { text: 'Excluir', onPress: async () => excluirCliente() }
          ]);
        }} secondary={true} maxWidth={170} />
      </View>

      <View style={{flexDirection: 'row', gap: 10, marginTop: 10, justifyContent: 'center'}}>
        <FormButton title="Tirar foto" onPress={tirarFoto} secondary={true} maxWidth={170} />
        <FormButton title="Gerar recibo" onPress={() => gerarReciboPDF(cliente)} secondary={true} maxWidth={170} />

        {modalShown && (
          <Modal animationType="slide" transparent={true} visible={modalShown} onRequestClose={() => {
            setModalShown(false);
            setAtendimento(false);
          }}>
            <View style={{padding: 20, flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
              <View style={{backgroundColor: colors.cardBackground, padding: 20, borderRadius: 10, borderWidth: 1, borderColor: colors.secondary, gap: 10}}>
                <Text style={{fontSize: 18, color: colors.title}}>Preencha as informações:</Text>
                <TextInput placeholder='Mapping' value={mapping} onChangeText={setMapping} style={[styles.input, inputFocused && styles.inputFocused]} onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)} onSubmitEditing={() => setTimeout(() => valorRef.current?.focus(), 100)} />
                <TextInput placeholder='Valor' value={valor} onChangeText={setValor} style={[styles.input, inputFocused2 && styles.inputFocused]} onFocus={() => setInputFocused2(true)} onBlur={() => setInputFocused2(false)} keyboardType="numeric" ref={valorRef} onSubmitEditing={() => setTimeout(() => observacoesRef.current?.focus(), 100)} />
                <TextInput placeholder='Observações' value={observacoes} onChangeText={setObservacoes} style={[styles.input, inputFocused3 && styles.inputFocused]} onFocus={() => setInputFocused3(true)} onBlur={() => setInputFocused3(false)} ref={observacoesRef} onSubmitEditing={async () => {
                  if (!mapping || !valor) {
                    Alert.alert('Erro', 'Preencha o mapeamento e o valor.');
                    return;
                  }
                  setModalShown(false);
                  atualizarProc(true);
                }} />
              </View>
            </View>
          </Modal>
        )}
      </View>

      <FormButton title="AI" onPress={() => navigation.navigate('Ai', { clienteId: cliente.id })} secondary={false} />
    </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', padding: 20, backgroundColor: '#FFF2F5' },
  image: { width: 180, height: 180, borderRadius: 100, marginBottom: 5},
  nome: { fontSize: 24, fontWeight: 'bold' },
  input: { backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.secondary, padding: 10, borderRadius: 10, color: colors.primaryDark },
  inputFocused: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.primary, padding: 10, borderRadius: 10 }
});