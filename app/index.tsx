import { Feather, FontAwesome } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { MotiView } from 'moti';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ImageBackground, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import colors from '../src/colors';
import { auth, database } from '../src/firebaseConfig';
import { useClientes } from '../src/screens/functions/ClientesContext';

WebBrowser.maybeCompleteAuthSession();

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [autoLogin, setAutoLogin] = useState(true);
  const senhaRef = useRef<TextInput>(null);

  const { limparClientes } = useClientes();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '326380062160-e6kfanq6m87solgmnq8ei34er99ni8f4.apps.googleusercontent.com',
    androidClientId: '326380062160-4b8nu335q425m0b3oq7nmpjr0n6a11c0.apps.googleusercontent.com',
    iosClientId: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified !== false) {
        limparClientes();
        navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
      } else {
        setAutoLogin(false);
      }
    });
    return unsubscribe;
  }, [autoLogin]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params!;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(async (result) => {
          await setDoc(doc(database, 'user', result.user.uid), {
            email: result.user.email,
            displayName: result.user.displayName,
          }, { merge: true });
          navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
        })
        .catch((error) => {
          Toast.show({
            type: 'error',
            text1: 'Erro ao fazer login com Google',
            text2: error.message,
            position: 'bottom',
          });
        });
    }
  }, [response]);

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
      <ImageBackground source={require('./images/background.png')} resizeMode="cover" style={{ flex: 1 }}>
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
                    autoCapitalize='none'
      
                  />
                  <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeButton}>
                    <Feather name={secure ? 'eye' : 'eye-off'} size={20} color={colors.secondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.loginRow}>
                  <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={login} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator color={colors.secondary} />
                    ) : (
                      <Text style={styles.buttonText}>Entrar</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => promptAsync()} disabled={!request} style={styles.googleButton}>
                    <FontAwesome name="google" size={20} color={colors.secondary} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={signUp}>
                  <Text style={styles.linkButton}>Cadastrar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={forgotPassword}>
                  <Text style={[styles.linkButton, { fontSize: 16, color: colors.secondary, textDecorationLine: 'underline' }]}>Esqueci minha senha</Text>
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
    flex: 1,
    paddingVertical: 14,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 8,
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
  loginRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    
  },
  googleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
  },
});
