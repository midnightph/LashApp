import colors from '@/src/colors';
import { database } from '@/src/firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { MotiText, MotiView } from 'moti';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { auth } from '../src/firebaseConfig';
import { Feather } from '@expo/vector-icons';

export default function FinalizarCad({ route, navigation }: any) {
  const { nome, sobrenome, telefone, data } = route.params;
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const senhaRef = useRef<TextInput>(null);
  const confirmarSenhaRef = useRef<TextInput>(null);

  const traduzirErroFirebase = (code: string) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'E-mail já cadastrado.';
      case 'auth/invalid-email':
        return 'E-mail inválido.';
      case 'auth/weak-password':
        return 'Senha muito fraca.';
      default:
        return 'Erro no cadastro. Tente novamente.';
    }
  };

  const signUp = async () => {
    if (!email || !senha || !confirmarSenha) {
      Toast.show({ type: 'error', text1: 'Preencha todos os campos!', position: 'bottom' });
      return;
    }
    if (senha !== confirmarSenha) {
      Toast.show({ type: 'error', text1: 'Senhas não conferem!', position: 'bottom' });
      return;
    }
    try {
      setLoading(true);
      const response = await createUserWithEmailAndPassword(auth, email, senha);
      const user = response.user;
      await sendEmailVerification(user);
      await setDoc(doc(database, 'user', user.uid), { nome, sobrenome, email, telefone, data }, { merge: true });
      Alert.alert('Sucesso!', 'Verifique seu e-mail antes de fazer login.');
      navigation.navigate('Login');
    } catch (error: any) {
      Toast.show({ type: 'error', text1: traduzirErroFirebase(error.code), position: 'bottom' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require('../app/images/background.png')} style={{flex: 1}}>
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <MotiText from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 }} style={styles.title}>
            Olá{nome ? ` ${nome}` : ''}, finalize seu cadastro:
          </MotiText>

          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }} style={styles.inputWrapper}>
            <TextInput
              placeholder="Email"
              placeholderTextColor={colors.secondary}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoComplete="email"
              keyboardType="email-address"
              autoCapitalize="none"
              onSubmitEditing={() => setTimeout(() => senhaRef.current?.focus(), 100)}
            />
          </MotiView>

          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 300 }} style={styles.inputWrapper}>
            <TextInput
              placeholder="Senha"
              placeholderTextColor={colors.secondary}
              style={styles.input}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={secure}
              autoCapitalize="none"
              ref={senhaRef}
              onSubmitEditing={() => setTimeout(() => confirmarSenhaRef.current?.focus(), 100)}
            />
          </MotiView>

          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 400 }} style={styles.passwordContainer}>
            <TextInput
              placeholder="Confirmar senha"
              placeholderTextColor={colors.secondary}
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={secure}
              autoCapitalize="none"
              ref={confirmarSenhaRef}
              onSubmitEditing={signUp}
            />
            <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeButton}>
              <Feather name={secure ? 'eye' : 'eye-off'} size={20} color={colors.secondary} />
            </TouchableOpacity>
          </MotiView>

          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 500 }} style={styles.inputWrapper}>
            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={signUp} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.background} /> : <Text style={styles.buttonText}>Finalizar cadastro</Text>}
            </TouchableOpacity>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    color: colors.textDark,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
