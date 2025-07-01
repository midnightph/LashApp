import FormButton from '@/src/FormButton';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { MotiView } from 'moti';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import colors from '../src/colors';
import { auth, database } from '../src/firebaseConfig';
import { useClientes } from '../src/screens/functions/ClientesContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('pedrorodacinski26@gmail.com');
  const [password, setPassword] = useState('Pedro!2606');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [autoLogin, setAutoLogin] = useState(true);
  const [error, setError] = useState('');
  const senhaRef = useRef<TextInput>(null);

  const { limparClientes } = useClientes();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        limparClientes();
        navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
      } else {
        setAutoLogin(false);
      }
    });
    return unsubscribe;
  }, [autoLogin]);

  const traduzirErroFirebase = (code: string) => {
  switch (code) {
    case 'auth/invalid-login-credentials':
      return 'E-mail ou senha incorretos.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    default:
      return 'Erro ao fazer login. Tente novamente.';
  }
};


  const login = async () => {
    if (!email || !password) {
      alert('Preencha todos os campos!');
      return;
    }
    try {
      setLoading(true);
      const response = await signInWithEmailAndPassword(auth, email, password);
      await setDoc(doc(database, 'user', response.user.uid), { email: response.user.email }, { merge: true });

      if (!response.user.emailVerified) {
        alert('Verifique seu email antes de continuar.');
      } else {
        limparClientes();
        setEmail('');
        setPassword('');
        navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
      }
    } catch (error) {
      const mensagem = traduzirErroFirebase(error.code);
      setError(mensagem)
      Toast.show({
        type: 'error',
        text1: mensagem,
        position: 'bottom'
      })
    } finally {
      setLoading(false);
    }
  };

  const signUp = () => navigation.navigate('Cadastro');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF2F5' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF2F5" />
    <View style={styles.container}>
      {!autoLogin === true && (
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0, scale: 1 }} style={styles.inner}>
        <Text style={styles.title}>Bem-vindo ao Studio Lash!</Text>

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          onSubmitEditing={() => setTimeout(() => senhaRef.current?.focus(), 100)}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Senha"
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            ref={senhaRef}
            onSubmitEditing={login}
          />
          <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeButton}>
            <Text style={{ fontSize: 16 }}>
              {secure ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={login}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Entrar</Text>
                    )}
                  </TouchableOpacity>

        <FormButton title="Cadastrar" onPress={signUp} secondary />
      </MotiView>
      )}
      
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: '80%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: colors.cardBackground,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  eyeButton: {
    paddingHorizontal: 10,
  },
  button: {
    width: '100%',
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
