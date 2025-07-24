// src/screens/Profile.tsx
import colors from '@/src/colors';
import { auth, database } from '@/src/firebaseConfig';
import FormButton from '@/src/FormButton';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { deleteDoc, doc, collection, getDocs } from 'firebase/firestore';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function Profile({ route, navigation }: any) {
  const { nome, telefone, sobrenome } = route.params;
  const [totalClientes, setTotalClientes] = useState(0);
  const [email, setEmail] = useState('');

  useEffect(() => {
    getTotalClientes();
  }, []);

  const getTotalClientes = async () => {
    try {
      const clientesCollection = collection(database, 'user', auth.currentUser.uid, 'Clientes');
      const clientesSnapshot = await getDocs(clientesCollection);
      setTotalClientes(clientesSnapshot.size);
      setEmail(auth.currentUser.email || '');
    } catch (error) {
      console.error('Erro ao buscar total de clientes:', error);
    }
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
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <MotiView
              style={styles.header}
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 500 }}
            >
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color={colors.secondary} />
              </TouchableOpacity>
              <Text style={styles.title}>Meu Perfil</Text>
            </MotiView>

            <View style={styles.card}>
              <Text style={styles.label}>Nome completo</Text>
              <Text style={styles.value}>{nome} {sobrenome}</Text>

              <Text style={styles.label}>Email</Text>
              {email ? (
                <Text style={styles.value}>{email}</Text>
              ) : (
                <ActivityIndicator size="small" color={colors.secondary} />
              )}

              <Text style={styles.label}>Telefone</Text>
              <Text style={styles.value}>
                {telefone ? telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : '-'}
              </Text>

              <Text style={styles.label}>Total de clientes</Text>
              <Text style={styles.value}>{totalClientes}</Text>
            </View>

            <View style={styles.buttons}>
              <FormButton title="Sair da conta" onPress={handleSignOut} />
              <TouchableOpacity style={styles.deleteButton} onPress={deleteAccount}>
                <Text style={styles.deleteText}>Excluir minha conta</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  container: { padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 12,
    padding: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  card: {
    backgroundColor: colors.textLight,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: 4,
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: colors.textDark,
  },
  buttons: {
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
