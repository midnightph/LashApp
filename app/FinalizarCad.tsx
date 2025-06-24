import { database } from '@/src/firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../src/firebaseConfig';

export default function FinalizarCad({ route, navigation }: any) {
  const { nome, telefone, dataNasc } = route.params;
  const [email, setEmail] = useState('pedrorodacinski26@gmail.com');
  const [senha, setSenha] = useState('Pedro!2606');
  const [confirmarSenha, setConfirmarSenha] = useState('Pedro!2606');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    if (!nome || !telefone || !dataNasc) {
      alert('Dados da tela anterior não recebidos!');
      return;
    }
    if (email === '' || senha === '' || confirmarSenha === '') {
      alert('Preencha todos os campos!');
      return;
    }
    if (senha !== confirmarSenha) {
      alert('As senhas devem ser iguais!');
      return;
    }
    try {
      setLoading(true);
      const response = await createUserWithEmailAndPassword(auth, email, senha);
      const user = response.user;
      await sendEmailVerification(user);
      await setDoc(doc(database, 'user', user.uid), {
        nome,
        email,
        telefone,
        dataNasc,
      });
      alert('Cadastro efetuado com sucesso! Cheque seu e-mail antes de fazer o login.');
      navigation.navigate('Login');
    } catch (error: any) {
      alert('Não conseguimos efetuar o cadastro: ' + error.message || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.title}>Olá {nome}, seja bem-vindo(a)!</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoComplete="email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          placeholder="Senha"
          placeholderTextColor="#999"
          value={senha}
          onChangeText={setSenha}
          autoComplete="password"
          secureTextEntry
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          placeholder="Confirmar Senha"
          placeholderTextColor="#999"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          autoComplete="password"
          secureTextEntry
          autoCapitalize="none"
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={signUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Finalizar cadastro!</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = {
  safe: {
    flex: 1,
    backgroundColor: '#FFF2F5',
    justifyContent: 'center',
  },
  container: {
    paddingHorizontal: 30,
    gap: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#C9184A',
    marginBottom: 25,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    fontSize: 16,
    color: '#444',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  button: {
    width: '100%',
    backgroundColor: '#C9184A',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#C9184A',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#a63752',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
};
