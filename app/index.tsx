import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../src/firebaseConfig';
import '../assets/fonts/SpaceMono-Regular.ttf';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Verifica se usuário já está logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        navigation.navigate('Tabs');
      }
    });
    return unsubscribe; // limpa o listener ao desmontar o componente
  }, []);

  const login = async () => {
    if (email === '' || password === '') {
      alert('Preencha todos os campos!');
      return;
    }
    try {
      setLoading(true);
      const response = await signInWithEmailAndPassword(auth, email, password);
      if (!response.user.emailVerified) {
        alert('Verifique seu email antes de continuar.');
      } else {
        navigation.navigate('Tabs');
      }
    } catch (error) {
      alert("Não conseguimos efetuar o login: " + error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    if (email === '' || password === '') {
      alert('Preencha todos os campos!');
      return;
    }
    try {
      setLoading(true);
      const response = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(response.user);
      alert("Cadastro efetuado com sucesso! Verifique seu email antes de fazer login.");
    } catch (error) {
      alert("Não conseguimos efetuar o cadastro: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Senha"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {loading && <Text>Carregando...</Text>}
      <TouchableOpacity onPress={login} style={styles.button}><Text>Login</Text></TouchableOpacity>
      <TouchableOpacity onPress={signUp} style={styles.button}><Text>Cadastro</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    fontFamily: 'SpaceMono-Regular',
  },
  input: {
    width: '80%', height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 10,
    marginBottom: 10, paddingHorizontal: 10,
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    width: '80%',
    backgroundColor: '#E8B4B4',
    borderStyle: 'solid',
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 10,
    maxWidth: 150,
    padding: 5,
    margin: 5
  }
});
