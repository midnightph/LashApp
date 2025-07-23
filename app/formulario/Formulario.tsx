import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Button,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Signature from 'react-native-signature-canvas';
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  arrayUnion,
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  deleteObject,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { database, auth } from '../../src/firebaseConfig';
import { debounce } from 'lodash';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import colors from '@/src/colors';
import { Ionicons } from '@expo/vector-icons';

export default function FormularioAtendimento({ navigation }: any) {
  // Estados do formulário
  const [nomeCliente, setNomeCliente] = useState('');
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
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingEnvio, setLoadingEnvio] = useState(false);

  const signatureRef = useRef<any>(null);

  // Converte base64 para Blob via arquivo temporário
  async function base64ToBlob(dataURL: string) {
    const [, base64] = dataURL.split(',');
    const path = FileSystem.cacheDirectory + 'assinatura.png';
    await FileSystem.writeAsStringAsync(path, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return await fetch(path).then(r => r.blob());
  }

  // Debounce na busca de clientes
  const debouncedSearch = useRef(
    debounce(async (text: string) => {
      if (text.length < 2) {
        setClientes([]);
        setLoadingClientes(false);
        return;
      }
      setLoadingClientes(true);
      const user = auth.currentUser;
      if (!user) {
        Toast.show({ type: 'error', text1: 'Usuário não autenticado' });
        setLoadingClientes(false);
        return;
      }
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
        Toast.show({ type: 'error', text1: 'Erro na busca', text2: e.message });
      } finally {
        setLoadingClientes(false);
      }
    }, 500)
  ).current;

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    debouncedSearch(text);
  };

  // Handler da assinatura (chamado ao salvar)
  const handleSignature = async (sig: string) => {
    setAssinatura(sig);
    await handleConfirmar(sig);
  };

  // Envio do formulário
  const handleConfirmar = async (sig: string) => {
    if (!clienteId || !procedimento || !sig) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Preencha todos os campos e assine o termo.',
      });
      return;
    }

    setLoadingEnvio(true);

    const user = auth.currentUser;
    if (!user) {
      Toast.show({ type: 'error', text1: 'Usuário não autenticado.' });
      setLoadingEnvio(false);
      return;
    }

    try {
      const storage = getStorage();
      const clientPath = `user/${user.uid}/Assinaturas/${clienteId}.png`;
      const imgRef = storageRef(storage, clientPath);

      try {
        await deleteObject(imgRef);
      } catch {
        // ignorar se não existir
      }

      const clienteDocRef = doc(database, 'user', user.uid, 'Clientes', clienteId);
      const clienteSnap = await getDoc(clienteDocRef);
      const existing = clienteSnap.data()?.formularioAtendimento || [];
      const filtered = existing.filter((at: any) => at.procedimento !== procedimento);
      await updateDoc(clienteDocRef, { formularioAtendimento: filtered });

      const blob = await base64ToBlob(sig);
      await uploadBytes(imgRef, blob);
      const url = await getDownloadURL(imgRef);

      const novoAtendimento = {
        procedimento,
        gravida,
        alergia,
        lentes,
        cuidados,
        assinaturaURL: url,
        criadoEm: new Date(),
      };
      await updateDoc(clienteDocRef, {
        formularioAtendimento: arrayUnion(novoAtendimento),
      });

      Toast.show({ type: 'success', text1: 'Atendimento atualizado com sucesso!' });

      // Resetar formulário
      setNomeCliente('');
      setClienteId(null);
      setProcedimento('');
      setGravida(false);
      setAlergia(false);
      setLentes(false);
      setCuidados(false);
      setAssinatura(null);

      signatureRef.current?.clearSignature();
    } catch (err: any) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar',
        text2: err.message || err.toString(),
      });
    } finally {
      setLoadingEnvio(false);
    }
  };

  const [procedimentos, setProcedimentos] = useState<
    Array<{ id: string; procedimento: string }>
  >([]);

  // Busca procedimentos ao montar
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      Toast.show({ type: 'error', text1: 'Usuário não autenticado' });
      navigation.navigate('Login');
      return;
    }

    const fetchProcedimentos = async () => {
      try {
        const docRef = collection(database, 'user', user.uid, 'Cuidados');
        const q = await getDocs(docRef);
        const procedimentosData = q.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        if (procedimentosData.length === 0) {
          Toast.show({
            type: 'info',
            text1: 'Cadastre um procedimento antes de preencher o formulário',
          });
        }
        setProcedimentos(procedimentosData);
      } catch (error) {
        console.error('Erro ao buscar procedimentos:', error);
        Toast.show({ type: 'error', text1: 'Erro ao buscar procedimentos' });
      }
    };

    fetchProcedimentos();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Cabeçalho */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 10,
          gap: 10,
          paddingHorizontal: 20,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={35} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.secondary }}>
          Formulário de Atendimento
        </Text>
      </View>

      {/* Modal de busca cliente */}
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
              accessibilityLabel="Campo para buscar cliente"
            />
            {loadingClientes && <ActivityIndicator size="small" color={colors.secondary} />}
            <FlatList
              data={clientes}
              keyExtractor={item => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.clienteItem}
                  onPress={() => {
                    setNomeCliente(item.name);
                    setClienteId(item.id);
                    setModalVisible(false);
                    setSearchTerm('');
                    setClientes([]);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar cliente ${item.name}`}
                >
                  <Text style={styles.clienteText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !loadingClientes && searchTerm.length >= 2 ? (
                  <Text style={{ textAlign: 'center', marginTop: 10 }}>Nenhum cliente encontrado</Text>
                ) : null
              }
            />
            <Button title="Fechar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Formulário */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <ScrollView style={styles.container} scrollEnabled={scrollEnabled} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Nome da cliente</Text>
          <TouchableOpacity
            style={[styles.input, { justifyContent: 'center' }]}
            onPress={() => setModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={nomeCliente ? `Cliente selecionado: ${nomeCliente}` : 'Clique para escolher cliente'}
          >
            <Text style={{ color: nomeCliente ? '#000' : '#999' }}>
              {nomeCliente || 'Clique para escolher'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Procedimento</Text>
          <Picker
            selectedValue={procedimento}
            mode="dropdown"
            prompt="Selecione um procedimento"
            dropdownIconColor={colors.secondary}
            dropdownIconRippleColor={colors.secondary}
            itemStyle={{ color: colors.secondary }}
            selectionColor={colors.secondary}
            style={styles.input}
            placeholder='Selecione um procedimento'
            onValueChange={(v) => setProcedimento(v as string)}
            accessibilityLabel="Selecionar procedimento"
          >
            <Picker.Item label="Selecione" value="" />
            {procedimentos.map((proc) => (
              <Picker.Item key={proc.id} label={proc.procedimento} value={proc.procedimento} />
            ))}
          </Picker>

          {['Está grávida?', 'Tem alergia conhecida?', 'Usa lentes de contato?', 'Cliente ciente dos cuidados?'].map((label, idx) => {
            const values = [gravida, alergia, lentes, cuidados];
            const setters = [setGravida, setAlergia, setLentes, setCuidados];
            return (
              <View key={label} style={styles.switchRow}>
                <Text style={styles.label}>{label}</Text>
                <Switch value={values[idx]} onValueChange={setters[idx]} />
              </View>
            );
          })}

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
              onEmpty={() => Toast.show({ type: 'error', text1: 'Assinatura vazia' })}
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

          <View style={{ marginVertical: 10, marginBottom: 30 }}>
            <Button
              title={loadingEnvio ? 'Enviando...' : 'Confirmar e Enviar'}
              color={colors.secondary}
              onPress={() => {
                if (!loadingEnvio) signatureRef.current?.readSignature();
              }}
              accessibilityLabel="Confirmar e enviar formulário"
              disabled={loadingEnvio}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#FFF2F5', flex: 1 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5, color: colors.secondary },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    minHeight: 45,
    color: '#333',
  },
  termo: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 15, color: '#333' },
  signatureContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    height: 250,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFF2F5',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10, color: colors.secondary },
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
