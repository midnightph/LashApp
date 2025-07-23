import colors from '@/src/colors';
import { auth, database } from '@/src/firebaseConfig';
import FormButton from '@/src/FormButton';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function Profile({ route, navigation }: any) {
  const { nome, telefone, sobrenome } = route.params;
  const [totalClientes, setTotalClientes] = useState(0);
  const [email, setEmail] = useState('');
  const [procedimento, setProcedimento] = useState('');
  const [cuidados, setCuidados] = useState('');
  const [procedimentos, setProcedimentos] = useState([]);

  useEffect(() => {
    getTotalClientes();
    fetchProcedimentos();
  }, []);

  async function getTotalClientes() {
    try {
      const clientesCollection = collection(database, 'user', auth.currentUser.uid, 'Clientes');
      const clientesSnapshot = await getDocs(clientesCollection);
      setTotalClientes(clientesSnapshot.size);
      setEmail(auth.currentUser.email || '');
    } catch (error) {
      console.error('Erro ao buscar total de clientes:', error);
    }
  }

  const adicionarProcedimento = async () => {
    if (!auth.currentUser) {
      return Toast.show({
        type: 'error',
        text1: 'Você precisa estar logado para adicionar um procedimento!',
        position: 'bottom',
      });
    }
    if (!procedimento.trim() || !cuidados.trim()) {
      return Toast.show({
        type: 'error',
        text1: 'Procedimento e cuidados não podem estar vazios.',
        position: 'bottom',
      });
    }

    const novoProcedimento = {
      procedimento: procedimento.trim(),
      cuidados: cuidados.trim(),
    };

    try {
      const docRef = await addDoc(collection(database, 'user', auth.currentUser.uid, 'Cuidados'), novoProcedimento);
      setProcedimentos((prev) => [...prev, { id: docRef.id, ...novoProcedimento }]);
      setProcedimento('');
      setCuidados('');
      Toast.show({ type: 'success', text1: 'Procedimento adicionado com sucesso!', position: 'bottom' });
    } catch (error) {
      console.log(error);
      Toast.show({ type: 'error', text1: 'Erro ao adicionar procedimento', position: 'bottom' });
    }
  };

  const fetchProcedimentos = async () => {
    try {
      const procedimentosCollection = collection(database, 'user', auth.currentUser.uid, 'Cuidados');
      const procedimentosSnapshot = await getDocs(procedimentosCollection);
      const lista = procedimentosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProcedimentos(lista);
    } catch (error) {
      console.log('Erro ao buscar procedimentos:', error);
    }
  };

  const excluirProcedimento = async (id: any) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir o procedimento?',
      [
        {
          text: 'Sim',
          onPress: async () => {
            try {
              await deleteDoc(doc(database, 'user', auth.currentUser.uid, 'Cuidados', id));
              setProcedimentos((prev) => prev.filter((item) => item.id !== id));
              Toast.show({ type: 'success', text1: 'Procedimento excluído com sucesso!', position: 'bottom' });
            } catch (error) {
              console.log(error);
              Toast.show({ type: 'error', text1: 'Erro ao excluir procedimento', position: 'bottom' });
            }
          },
        },
        { text: 'Não', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const deleteAccount = async () => {
    Alert.alert(
      'Excluir Conta',
      'Tem certeza que deseja excluir sua conta? Esta ação é irreversível.',
      [
        {
          text: 'Sim',
          onPress: async () => {
            try {
              await deleteDoc(doc(database, 'user', auth.currentUser.uid));
              await auth.currentUser.delete();
              Toast.show({ type: 'success', text1: 'Conta excluída com sucesso!', position: 'bottom' });
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } catch (error) {
              console.log(error);
              Toast.show({ type: 'error', text1: 'Erro ao excluir conta', position: 'bottom' });
            }
          },
        },
        { text: 'Não', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <ImageBackground source={require('../images/background.png')} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
          keyboardVerticalOffset={90}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <MotiView
              style={styles.headerContainer}
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 600 }}
            >
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Voltar">
                <Ionicons name="arrow-back" size={32} color={colors.secondary} />
              </TouchableOpacity>
              <Text style={styles.title}>Perfil</Text>
            </MotiView>

            <View style={styles.infoSection}>
              <Text style={styles.label}>Nome:</Text>
              <Text style={styles.infoText}>{nome} {sobrenome}</Text>

              <Text style={styles.label}>Email:</Text>
              {email ? <Text style={styles.infoText}>{email}</Text> : <ActivityIndicator color={colors.secondary} size="small" />}

              <Text style={styles.label}>Telefone:</Text>
              <Text style={styles.infoText}>
                {telefone ? telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") : '-'}
              </Text>

              <Text style={styles.label}>Total de clientes:</Text>
              <Text style={styles.infoText}>{totalClientes}</Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Adicionar Procedimento</Text>
              <TextInput
                style={styles.input}
                placeholder="Procedimento"
                value={procedimento}
                onChangeText={setProcedimento}
                placeholderTextColor={colors.title}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Cuidados"
                multiline
                value={cuidados}
                onChangeText={setCuidados}
                placeholderTextColor={colors.title}
              />
              <FormButton title="Salvar" onPress={adicionarProcedimento} />
            </View>

            <View style={styles.separator} />

            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>Procedimentos</Text>
              {procedimentos.length === 0 ? (
                <Text style={styles.noProcedimentos}>Nenhum procedimento cadastrado.</Text>
              ) : (
                <FlatList
                  data={procedimentos}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.procedimentoItem}
                      onPress={() => excluirProcedimento(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Excluir procedimento ${item.procedimento}`}
                    >
                      <Text style={styles.procedimentoTitle}>{item.procedimento}</Text>
                      <Text style={styles.procedimentoCuidados}>{item.cuidados}</Text>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              )}
            </View>

            <View style={styles.separator} />

            <FormButton title="Sair" onPress={handleSignOut} />

            <TouchableOpacity style={styles.deleteButton} onPress={deleteAccount} accessibilityRole="button" accessibilityLabel="Deletar conta">
              <Text style={styles.deleteButtonText}>Deletar Conta</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.secondary,
  },
  infoSection: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 12,
  },
  separator: {
    height: 1,
    backgroundColor: colors.primaryDark,
    opacity: 0.15,
    marginVertical: 15,
    borderRadius: 1,
  },
  formSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.textLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    color: colors.textDark,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  listSection: {
    marginBottom: 20,
  },
  noProcedimentos: {
    fontSize: 16,
    color: colors.title,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  procedimentoItem: {
    backgroundColor: colors.textLight,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  procedimentoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 6,
  },
  procedimentoCuidados: {
    fontSize: 15,
    color: colors.textDark,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: colors.textLight,
    fontWeight: '700',
    fontSize: 16,
  },
});
