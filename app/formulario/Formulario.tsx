import React, { useState, useRef, useEffect, use } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, FlatList,
  StyleSheet, ActivityIndicator, Alert, ScrollView, Switch, Button,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Signature from 'react-native-signature-canvas';
import {
  collection, query, where, limit, getDocs,
  getDoc, updateDoc, doc, arrayUnion,
} from 'firebase/firestore';
import {
  getStorage, ref as storageRef, deleteObject, uploadBytes, getDownloadURL,
} from 'firebase/storage';
import { database, auth } from '../../src/firebaseConfig';
import { debounce, get } from 'lodash';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import { getAuth } from 'firebase/auth';
import Toast from 'react-native-toast-message';

export default function FormularioAtendimento({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [procedimento, setProcedimento] = useState('');
  const [gravida, setGravida] = useState(false);
  const [alergia, setAlergia] = useState(false);
  const [lentes, setLentes] = useState(false);
  const [cuidados, setCuidados] = useState(false);
  const [assinatura, setAssinatura] = useState<string | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  const signatureRef = useRef<any>(null);

  // converte base64 para Blob via arquivo temporário
  async function base64ToBlob(dataURL: string) {
    const [, base64] = dataURL.split(',');
    const path = FileSystem.cacheDirectory + 'assinatura.png';
    await FileSystem.writeAsStringAsync(path, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return await fetch(path).then(r => r.blob());
  }

  // busca clientes com debounce…
  const debouncedSearch = useRef(
    debounce(async (text: string) => {
      if (text.length < 2) { setClientes([]); setLoading(false); return; }
      setLoading(true);
      const user = auth.currentUser;
      if (!user) { Alert.alert('Usuário não autenticado'); setLoading(false); return; }
      try {
        const q = query(
          collection(database, 'user', user.uid, 'Clientes'),
          where('name', '>=', text),
          where('name', '<=', text + '\uf8ff'),
          limit(10)
        );
        const snap = await getDocs(q);
        setClientes(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      } catch (e: any) {
        Alert.alert('Erro na busca', e.message);
      } finally {
        setLoading(false);
      }
    }, 500)
  ).current;

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    debouncedSearch(text);
  };

  const handleSignature = async (sig: string) => {
    setAssinatura(sig);
    Alert.alert('Assinatura capturada!');
    await handleConfirmar(sig);
  };

  const handleConfirmar = async (sig: string) => {
    if (!clienteId || !procedimento || !sig) {
      Alert.alert('Preencha todos os campos e assine o termo.');
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Usuário não autenticado.');
      return;
    }

    try {
      const storage = getStorage();
      const clientPath = `user/${user.uid}/Assinaturas/${clienteId}.png`;
      const imgRef = storageRef(storage, clientPath);

      // 1) tenta deletar arquivo antigo (se existir)
      try {
        await deleteObject(imgRef);
      } catch {
        // ignora erro caso não exista
      }

      // 2) busca doc e filtra atendimentos antigos deste procedimento
      const clienteDocRef = doc(database, 'user', user.uid, 'Clientes', clienteId);
      const clienteSnap = await getDoc(clienteDocRef);
      const existing = clienteSnap.data()?.formularioAtendimento || [];
      const filtered = existing.filter((at: any) => at.procedimento !== procedimento);
      // atualiza array sem o antigo
      await updateDoc(clienteDocRef, { formularioAtendimento: filtered });

      // 3) converte dataURL para Blob e faz upload
      const blob = await base64ToBlob(sig);
      await uploadBytes(imgRef, blob);
      const url = await getDownloadURL(imgRef);

      // 4) adiciona o novo atendimento
      const novo = {
        procedimento,
        gravida,
        alergia,
        lentes,
        cuidados,
        assinaturaURL: url,
        criadoEm: new Date(),
      };
      await updateDoc(clienteDocRef, {
        formularioAtendimento: arrayUnion(novo),
      });

      Alert.alert('Atendimento atualizado com sucesso!');
      // limpa estado
      setNome('');
      setClienteId(null);
      setProcedimento('');
      setGravida(false);
      setAlergia(false);
      setLentes(false);
      setCuidados(false);
      setAssinatura(null);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Erro ao salvar', err.message || err.toString());
    }
  };

  const [procedimentos, setProcedimentos] = useState([]);

  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) {
      Alert.alert('Usuário não autenticado');
      return navigation.navigate('Login');
    }

    const fetchProcedimentos = async () => {
      try {
        const docRef = collection(database, 'user', user.uid, 'Cuidados');
        const q = await getDocs(docRef);
        const procedimentosData = q.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (procedimentosData.length === 0) {
          return Toast.show(
            { type: 'info', text1: 'Cadastre um procedimento antes de preencher o formulário', position: 'bottom' }
          );
        }
        setProcedimentos(procedimentosData);
    } catch (error) {
        console.error('Erro ao buscar procedimentos:', error);
      }
    };

    fetchProcedimentos();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Modal de Busca */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Buscar Cliente</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Digite nome da cliente"
              value={searchTerm}
              onChangeText={handleSearchChange}
              autoFocus
            />
            {loading && <ActivityIndicator size="small" color="#C62368" />}
            <FlatList
              data={clientes}
              keyExtractor={i => i.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.clienteItem}
                  onPress={() => {
                    setNome(item.name);     // atribui o campo 'name'
                    setClienteId(item.id);
                    setModalVisible(false);
                    setSearchTerm('');
                    setClientes([]);
                  }}
                >
                  <Text style={styles.clienteText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !loading && searchTerm.length >= 2 && (
                  <Text style={{ textAlign: 'center', marginTop: 10 }}>
                    Nenhum cliente encontrado
                  </Text>
                )
              }
            />
            <Button title="Fechar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Formulário */}
      <ScrollView style={styles.container} scrollEnabled={scrollEnabled}>
        <Text style={styles.label}>Nome da cliente</Text>
        <TouchableOpacity
          style={[styles.input, { justifyContent: 'center' }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: nome ? '#000' : '#999' }}>{nome || 'Clique para escolher'}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Procedimento</Text>
        <Picker
          selectedValue={procedimento}
          style={styles.input}
          onValueChange={v => setProcedimento(v as string)}
        >
          <Picker.Item label="Selecione" value="" />
          {procedimentos.map(proc => (
            <Picker.Item key={proc.id} label={proc.procedimento} value={proc.procedimento} />
          ))}
        </Picker>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Está grávida?</Text>
          <Switch value={gravida} onValueChange={setGravida} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Tem alergia conhecida?</Text>
          <Switch value={alergia} onValueChange={setAlergia} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Usa lentes de contato?</Text>
          <Switch value={lentes} onValueChange={setLentes} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Cliente ciente dos cuidados?</Text>
          <Switch value={cuidados} onValueChange={setCuidados} />
        </View>

        <Text style={styles.label}>Termo de Responsabilidade</Text>
        <Text style={styles.termo}>
          Declaro que fui informada sobre os cuidados, riscos e possíveis reações adversas.
          Autorizo a realização do(s) procedimento(s) estético(s) e assumo total responsabilidade pelo mesmo.
        </Text>

        <Text style={styles.label}>Assinatura da cliente</Text>
        <View style={styles.signatureContainer}>
          <Signature
            ref={signatureRef}
            onBegin={() => setScrollEnabled(false)}
            onEnd={() => setScrollEnabled(true)}
            onOK={handleSignature}
            onEmpty={() => Alert.alert('Assinatura vazia')}
            descriptionText="Assine acima"
            clearText="Limpar"
            confirmText="Salvar"
            autoClear={false}
            webStyle={`
              .m-signature-pad--footer { display: none; }
              .m-signature-pad { box-shadow: none; border: none; }
              canvas { background-color: white; height: 100%; }
            `}
          />
        </View>

        <View style={{ marginVertical: 10, marginBottom: 20 }}>
          <Button
            title="Confirmar e Enviar"
            color="#C62368"
            onPress={() => {
              signatureRef.current?.readSignature(); // isso dispara o handleSignature
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#FFF2F5' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#C62368' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    minHeight: 45,
  },
  termo: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 15 },
  signatureContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    height: 250,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#FFF2F5', borderRadius: 12, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10, color: '#C62368' },
  modalInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clienteItem: { paddingVertical: 10, borderBottomColor: '#ddd', borderBottomWidth: 1 },
  clienteText: { fontSize: 16, color: '#333' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
});
