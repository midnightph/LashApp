import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Signature from 'react-native-signature-canvas';
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { debounce } from 'lodash';
import { database, auth } from '../../src/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

// Função para converter base64 em Blob (compatível com React Native)
async function base64ToBlob(base64: string, contentType = 'image/png') {
  const response = await fetch(`data:${contentType};base64,${base64}`);
  const blob = await response.blob();
  return blob;
}

export default function FormularioAtendimento() {
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

  const debouncedSearch = useRef(
    debounce(async (text: string) => {
      if (text.length < 2) {
        setClientes([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      if (!auth) {
        Alert.alert('Usuário não logado');
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(database, 'user', auth.uid, 'Clientes'),
          where('name', '>=', text),
          where('name', '<=', text + '\uf8ff'),
          limit(10)
        );
        const snap = await getDocs(q);
        setClientes(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      } catch (e: any) {
        Alert.alert('Erro na busca:', e.message);
      } finally {
        setLoading(false);
      }
    }, 500)
  ).current;

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    debouncedSearch(text);
  };

  const handleSignature = (sig: string) => {
    setAssinatura(sig);
    Alert.alert('Assinatura capturada com sucesso!');
  };

  const handleSalvarAssinatura = () => {
    signatureRef.current?.readSignature();
  };

  const handleConfirmar = async () => {
    if (!clienteId || !procedimento || !cuidados || !assinatura) {
      Alert.alert('Preencha todos os campos e assine o termo.');
      return;
    }

    if (!auth) {
      Alert.alert('Usuário não autenticado.');
      return;
    }

    try {
      // Upload da assinatura convertendo base64 em Blob
      const storage = getStorage();
      const imgRef = storageRef(storage, `assinaturas/${clienteId}.png`);
      const b64 = assinatura.replace(/^data:image\/png;base64,/, '');

      const blob = await base64ToBlob(b64);

      await uploadBytes(imgRef, blob, { contentType: 'image/png' });
      const url = await getDownloadURL(imgRef);

      // Cria objeto de atendimento
      const novo = {
        nome,
        procedimento,
        gravida,
        alergia,
        lentes,
        cuidados,
        assinaturaURL: url,
        criadoEm: new Date(),
      };

      // Atualiza o array formularioAtendimento no doc da cliente
      const clienteDoc = doc(database, 'user', auth.uid, 'Clientes', clienteId);
      await updateDoc(clienteDoc, {
        formularioAtendimento: arrayUnion(novo),
      });

      Alert.alert('Atendimento salvo com sucesso!');

      // Limpa o formulário
      setNome('');
      setClienteId(null);
      setProcedimento('');
      setGravida(false);
      setAlergia(false);
      setLentes(false);
      setCuidados(false);
      setAssinatura(null);
    } catch (err: any) {
      Alert.alert('Erro ao salvar:', err.message);
      console.log(err);
    }
  };

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
              keyExtractor={(i) => i.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.clienteItem}
                  onPress={() => {
                    setNome(item.name);
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
          onValueChange={(v) => setProcedimento(v)}
        >
          <Picker.Item label="Selecione" value="" />
          <Picker.Item label="Extensão de cílios" value="Extensão de cílios" />
          <Picker.Item label="Design de sobrancelha" value="Design de sobrancelha" />
          <Picker.Item label="Limpeza de pele" value="Limpeza de pele" />
        </Picker>

        <Text style={styles.label}>Está grávida?</Text>
        <Switch value={gravida} onValueChange={setGravida} />

        <Text style={styles.label}>Tem alergia conhecida?</Text>
        <Switch value={alergia} onValueChange={setAlergia} />

        <Text style={styles.label}>Usa lentes de contato?</Text>
        <Switch value={lentes} onValueChange={setLentes} />

        <Text style={styles.label}>Cliente está ciente dos cuidados?</Text>
        <Switch value={cuidados} onValueChange={setCuidados} />

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

        <View style={{ marginBottom: 20 }}>
          <Button
            title="Salvar Assinatura"
            onPress={() => signatureRef.current?.readSignature()}
            color="#C62368"
          />
        </View>

        <Button title="Confirmar e Enviar" onPress={handleConfirmar} color="#C62368" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#FFF2F5' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 15, color: '#C62368' },
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
});
