import FormButton from '@/src/FormButton';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { MotiView } from 'moti';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ImageBackground, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
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
    } catch (error: any) {
      const mensagem = traduzirErroFirebase(error.code);
      setError(mensagem);
      Toast.show({
        type: 'error',
        text1: mensagem,
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = () => navigation.navigate('Cadastro');

  const forgotPassword = () => navigation.navigate('ForgotPassword');

  return (
    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 1000 }} style={{ flex: 1 }}>
    <ImageBackground source={require('./images/background.png')} resizeMode="cover" style={{flex: 1}}>
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        {!autoLogin && (
          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} style={styles.inner}>
            <Text style={styles.title}>Bem-vindo(a) ao{'\n'}Studio Lash!</Text>

            <TextInput
              placeholder="Email"
              placeholderTextColor={colors.secondary}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              onSubmitEditing={() => setTimeout(() => senhaRef.current?.focus(), 100)}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Senha"
                placeholderTextColor={colors.secondary}
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secure}
                ref={senhaRef}
                onSubmitEditing={login}
              />
              <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeButton}>
                <Feather name={secure ? 'eye' : 'eye-off'} size={20} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={login} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.secondary} />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={signUp}>
              <Text style={styles.linkButton}>Cadastrar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={forgotPassword}>
              <Text style={[styles.linkButton, {fontSize: 16, color: colors.secondary, textDecorationLine: 'underline'}]}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </MotiView>
        )}
      </View>
    </SafeAreaView>
    </ImageBackground>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: '85%',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
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
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.background,
  },
});
