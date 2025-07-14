import colors from '@/src/colors';
import { auth, database } from '@/src/firebaseConfig';
import FormButton from '@/src/FormButton';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  addDoc,
  query,
  where,
} from 'firebase/firestore';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

type Cuidados = { procedimento: string; instrucoes: string };

export default function Profile({ route, navigation }: any) {
  const { nome, telefone } = route.params;
  const [totalClientes, setTotalClientes] = useState<number | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [procedimento, setProcedimento] = useState<string>('');
  const [instrucoes, setInstrucoes] = useState<string>('');
  const [cuidados, setCuidados] = useState<Cuidados[]>([]);
  const [loadingCuidados, setLoadingCuidados] = useState(false);

  async function getTotalClientes() {
    const col = collection(database, 'user', auth.currentUser!.uid, 'Clientes');
    const snap = await getDocs(col);
    setTotalClientes(snap.size);
    setEmail(auth.currentUser!.email);
  }

  async function loadCuidados() {
    setLoadingCuidados(true);
    const col = query(
      collection(database, 'user', auth.currentUser!.uid, 'Cuidados'),
      where('procedimento', '!=', '')
    );
    const snap = await getDocs(col);
    setCuidados(snap.docs.map(d => d.data() as Cuidados));
    setLoadingCuidados(false);
  }

  async function saveCuidado() {
    if (!procedimento.trim() || !instrucoes.trim()) {
      return Toast.show({ type: 'error', text1: 'Preencha procedimento e instruções', position: 'bottom' });
    }
    await addDoc(
      collection(database, 'user', auth.currentUser!.uid, 'Cuidados'),
      { procedimento, instrucoes }
    );
    Toast.show({ type: 'success', text1: 'Cuidado salvo', position: 'bottom' });
    setProcedimento('');
    setInstrucoes('');
    loadCuidados();
  }

  useEffect(() => {
    getTotalClientes();
    loadCuidados();
  }, []);

  const deleteAccount = async () => {
    await deleteDoc(doc(database, 'user', auth.currentUser!.uid));
    await auth.currentUser!.delete().catch(console.log);
    Toast.show({ type: 'success', text1: 'Conta excluída com sucesso!', position: 'bottom' });
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <ImageBackground source={require('../images/background.png')} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, padding: 15 }}>
        <MotiView
          style={styles.header}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 800 }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={35} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Perfil</Text>
        </MotiView>

        <MotiView
          style={styles.infoSection}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 200, duration: 800 }}
        >
          <Text style={styles.text}>Nome: {nome}</Text>
          <Text style={styles.text}>Email: {email ?? <ActivityIndicator size="small" />}</Text>
          <Text style={styles.text}>
            Telefone: {telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
          </Text>
          <Text style={styles.text}>
            Total de clientes: {totalClientes ?? <ActivityIndicator />}
          </Text>
        </MotiView>

        <MotiView
          style={styles.cuidadosSection}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400, duration: 800 }}
        >
          <Text style={styles.subTitle}>Cuidados por Procedimento</Text>
          <TextInput
            placeholder="Procedimento"
            value={procedimento}
            onChangeText={setProcedimento}
            style={styles.input}
          />
          <TextInput
            placeholder="Instruções"
            value={instrucoes}
            onChangeText={setInstrucoes}
            style={[styles.input, { height: 80 }]}
            multiline
          />
          <FormButton title="Salvar Cuidado" onPress={saveCuidado} />
        </MotiView>

        <MotiView
          style={styles.cuidadosList}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 600, duration: 800 }}
        >
          {loadingCuidados ? (
            <ActivityIndicator />
          ) : (
            cuidados.map((c, i) => (
              <View key={i} style={styles.cuidadoItem}>
                <Text style={styles.cuidadoProc}>{c.procedimento}</Text>
                <Text style={styles.cuidadoInst}>{c.instrucoes}</Text>
              </View>
            ))
          )}
        </MotiView>

        <MotiView
          style={styles.footer}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 800, duration: 800 }}
        >
          <FormButton
            title="Sair"
            onPress={async () => {
              await signOut(auth);
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }}
          />
          <TouchableOpacity style={styles.deleteBtn} onPress={deleteAccount}>
            <Text style={styles.deleteTxt}>Deletar Conta</Text>
          </TouchableOpacity>
        </MotiView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  pageTitle: { fontSize: 25, fontWeight: 'bold', color: colors.primary, marginLeft: 10 },
  infoSection: { marginBottom: 20 },
  text: { fontSize: 18, fontWeight: 'bold', color: colors.textDark, marginBottom: 5 },
  cuidadosSection: { padding: 15, backgroundColor: colors.cardBackground, borderRadius: 12, marginBottom: 20 },
  subTitle: { fontSize: 20, fontWeight: 'bold', color: colors.secondary, marginBottom: 10 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.secondary, borderRadius: 8, padding: 10, marginBottom: 10 },
  cuidadosList: { flex: 1 },
  cuidadoItem: { padding: 10, borderBottomWidth: 1, borderColor: colors.border },
  cuidadoProc: { fontWeight: 'bold', color: colors.primaryDark },
  cuidadoInst: { color: colors.textDark },
  footer: { marginTop: 20 },
  deleteBtn: { backgroundColor: colors.danger, padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  deleteTxt: { color: '#fff', fontWeight: 'bold' },
});