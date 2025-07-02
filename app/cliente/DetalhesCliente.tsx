import colors from '@/src/colors';
import { database, uploadImagem } from '@/src/firebaseConfig';
import FormButton from '@/src/FormButton';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { arrayUnion, deleteDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { MotiView } from 'moti';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useClientes } from '../../src/screens/functions/ClientesContext';
import { gerarReciboPDF } from '../../src/screens/functions/gerarRecibo';
import { deleteObject, getStorage, ref } from 'firebase/storage';

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
    quality: 0.4,
    base64: false
  });

  if (!resultado.canceled) {
    const uri = resultado.assets[0].uri;
    const urlFirebase = await uploadImagem(uri, cliente.id);
    await updateDoc(doc(database, 'user', getAuth().currentUser.uid, 'Clientes', cliente.id), { foto: urlFirebase });
    setImagem(urlFirebase);
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
      if(proc == true) {
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
    const storage = getStorage();
    const storagePath = cliente.foto;
    const decodePath = decodeURIComponent(storagePath);
    const imageRef = ref(storage, decodePath);
    try{
      
      await deleteDoc(doc(database, 'user', user.uid, 'Clientes', cliente.id));
      await deleteObject(imageRef);
      Toast.show({
        type: 'info',
        text1: 'Cliente excluido com sucesso!',
        position: 'bottom'
      })
      limparClientes()
      await carregarClientes()

      navigation.goBack()
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
    }}

  const [inputFocused, setInputFocused] = useState(false);
  const [inputFocused2, setInputFocused2] = useState(false);
  const [inputFocused3, setInputFocused3] = useState(false);

  const valorRef = useRef<TextInput>(null);
  const observacoesRef = useRef<TextInput>(null);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FFF2F5', paddingHorizontal: 20}}>
      <MotiView style={{alignItems: 'center', marginTop: 20, display: 'flex', flexDirection: 'row', gap: 20, justifyContent: 'center'}} 
      from={{opacity: 0, scale: 0.5, translateY: 50}}
      animate={{opacity: 1, scale: 1, translateY: 0}}
      transition={{type: 'timing', duration: 500}}>
        <Image source={{uri: cliente.foto}} style={styles.image}/>
        <View style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          <Text style={{fontSize: 24, color: colors.primary, fontWeight: 'bold', maxWidth: 150}}>{cliente.name.split(' ').slice(0, 2).join(' ')}</Text>
          <TouchableOpacity onPress={() => {
            Linking.openURL(`https://wa.me/${cliente.telefone}`);
          }}>
            <Text style={{fontSize: 18, color: colors.title, textDecorationLine: 'underline', fontWeight: 'bold'}}>{cliente.telefone}</Text>
          </TouchableOpacity>
          {atendimento ? (
            <Text style={{fontSize: 10, color: colors.success, fontWeight: 'bold'}}>Atendimento em andamento</Text>
          ): <Text style={{fontSize: 10, color: colors.success, fontWeight: 'bold'}}></Text>}
        </View>
      </MotiView>

      <View style={{backgroundColor: colors.cardBackground, padding: 20, borderRadius: 10, marginTop: 20, borderColor: colors.secondary, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, elevation: 3}}> 
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

      <View style={{display: 'flex', flexDirection: 'row', gap: 10, marginTop: 20, justifyContent: 'center'}}>
      <FormButton
  title={atendimento ? 'Encerrar atendimento' : 'Iniciar atendimento'}
  onPress={() => {
    if (!atendimento) {
      setAtendimento(true);      // ✅ já muda o status
      setModalShown(true);       // ✅ mostra o modal
    } else {
      setAtendimento(false);     
      atualizarProc(false); 
    }
  }}
  secondary={!atendimento}
  maxWidth={170}
/>
      <FormButton title="Excluir cliente" onPress={() => {
        Alert.alert(
      'Excluir Cliente',
      'Tem certeza que deseja excluir esse cliente?',
      [
        {
          text: 'Não',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          onPress: async () => {
            await excluirCliente();
          }
        }
      ],
      { cancelable: true }
    )
      }} secondary={true} maxWidth={170}/>
      </View>
      <View style={{display: 'flex', flexDirection: 'row', gap: 10, marginTop: 10, justifyContent: 'center'}}>
        <FormButton title="Tirar foto" onPress={tirarFoto} secondary={true} maxWidth={170}/>
        <FormButton title="Gerar recibo" onPress={() => gerarReciboPDF(cliente, valor)} secondary={true} maxWidth={170}/>
          {modalShown && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalShown}
          onRequestClose={() => {
            setModalShown(false);
            setAtendimento(false);
          }}
        >
          <View style={{padding: 20, flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
            <View style={{backgroundColor: colors.cardBackground, padding: 20, borderRadius: 10, borderWidth: 1, borderColor: colors.secondary, gap: 10}}>
              <Text style={{fontSize: 18, color: colors.title}}>Preencha as informações:</Text>
              <TextInput placeholder='Mapping' 
              value={mapping} 
              onChangeText={setMapping} 
              style={[styles.input, inputFocused && styles.inputFocused]} 
              onFocus={() => setInputFocused(true)} 
              onBlur={() => setInputFocused(false)}
              onSubmitEditing={() => setTimeout(() => valorRef.current?.focus(), 100)}
              />
              <TextInput placeholder='Valor' 
              value={valor} 
              onChangeText={setValor} 
              style={[styles.input, inputFocused2 && styles.inputFocused]} 
              onFocus={() => setInputFocused2(true)} 
              onBlur={() => setInputFocused2(false)} keyboardType="numeric"
              ref={valorRef}
              onSubmitEditing={() => setTimeout(() => observacoesRef.current?.focus(), 100)}
              />
              <TextInput placeholder='Observacoes' 
              value={observacoes} 
              onChangeText={setObservacoes} 
              style={[styles.input, inputFocused3 && styles.inputFocused]} 
              onFocus={() => setInputFocused3(true)} 
              onBlur={() => setInputFocused3(false)}
              ref={observacoesRef}
              onSubmitEditing={() => {
                if (!mapping || !valor) {
                  Alert.alert('Erro', 'Preencha o mapeamento e o valor.');
                  return;
                }
                setModalShown(false);
                atualizarProc(true); // ✅ salva direto
              }}
              />
            </View>
          </View>
        </Modal>
      )}
      </View>
      <FormButton title="AI" onPress={() => navigation.navigate('AI', {clienteId: cliente.id})} secondary={false}/>

      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', padding: 20, backgroundColor: '#FFF2F5'},
  image: { width: 180, height: 180, borderRadius: 100, marginBottom: 5, borderWidth: 3, borderColor: colors.secondary},
  nome: { fontSize: 24, fontWeight: 'bold' },
  input: {backgroundColor: colors.cardBackground, 
    borderWidth: 1, 
    borderColor: colors.secondary, 
    padding: 10, 
    borderRadius: 10,
    color: colors.primaryDark
  },
  inputFocused: {
    backgroundColor: colors.background, 
    borderWidth: 1, 
    borderColor: colors.primary, 
    padding: 10, 
    borderRadius: 10,
  }
});
