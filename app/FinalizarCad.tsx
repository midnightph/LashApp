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

export default function FinalizarCad({ route, navigation }: any) {
  const { nome, sobrenome, telefone, data } = route.params;
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const senhaRef = useRef<TextInput>(null);
  const confirmarSenhaRef = useRef<TextInput>(null);

  const signUp = async () => {
    if (!email || !senha || !confirmarSenha) {
      Toast.show({
        type: 'error',
        text1: 'Preencha todos os campos corretamente!',
        position: 'bottom',
      });
      return;
    }

    if (senha !== confirmarSenha) {
      Toast.show({
        type: 'error',
        text1: 'Senhas diferentes!',
        position: 'bottom',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await createUserWithEmailAndPassword(auth, email, senha);
      const user = response.user;
      await sendEmailVerification(user);
      await setDoc(doc(database, 'user', user.uid), {
        nome,
        sobrenome,
        email,
        telefone,
        data,
      });
      Alert.alert('Cadastro efetuado com sucesso!', 'Cheque seu e-mail antes de fazer o login.');
      navigation.navigate('Login');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: traduzirErroFirebase(error.code),
        position: 'bottom',
      })
    } finally {
      setLoading(false);
    }
  };

  const traduzirErroFirebase = (code: string) => {
    switch (code) {
      case 'auth/invalid-login-credentials':
        return 'E-mail ou senha incorretos.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde.';
      case 'auth/email-already-in-use':
        return 'E-mail já cadastrado.';
      default:
        return 'Erro ao fazer login. Tente novamente.';
    }
  };

  return (
    <ImageBackground source={require('../app/images/background.png')} style={{flex: 1}}>
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor='#FFF2F5' barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <MotiText
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100, type: 'timing' }}
            style={styles.title}>Olá{nome ? ` ${nome}` : ''}, para finalizarmos seu cadastro, precisamos de algumas informações:</MotiText>

          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200, type: 'timing' }}
            style={{ width: '100%' }}>
            <TextInput
              placeholder="Email"
              placeholderTextColor={colors.secondary}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoComplete="email"
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
              onSubmitEditing={() => setTimeout(() => senhaRef.current?.focus(), 100)}
            />
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300, type: 'timing' }}
            style={{ width: '100%' }}>
            <TextInput
              placeholder="Senha"
              placeholderTextColor={colors.secondary}
              style={styles.input}
              value={senha}
              onChangeText={setSenha}
              autoComplete="password"
              secureTextEntry={secure}
              autoCapitalize="none"
              ref={senhaRef}
              textContentType="password"
              onSubmitEditing={() => setTimeout(() => confirmarSenhaRef.current?.focus(), 100)}
            />
          </MotiView>
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400, type: 'timing' }}
            style={{ width: '100%' }}>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Confirmar senha"
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={confirmarSenha}
                placeholderTextColor={colors.secondary}
                onChangeText={setConfirmarSenha}
                secureTextEntry={secure}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                ref={confirmarSenhaRef}
                onSubmitEditing={signUp}
              />
              <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeButton}>
                <Text style={{ fontSize: 16 }}>
                  {secure ? '👁️' : '🙈'}
                </Text>
              </TouchableOpacity>
            </View>
          </MotiView>
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500, type: 'timing' }}
            style={{ width: '100%' }}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={signUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.buttonText}>Finalizar cadastro!</Text>
              )}
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
    flex: 1
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
  container: {
    flexGrow: 1,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
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
});
