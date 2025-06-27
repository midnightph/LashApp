import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import MaskInput, { Masks } from 'react-native-mask-input';
import { Timestamp } from 'firebase/firestore';

export default function Cadastro({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNasc, setDataNasc] = useState('');

  let data: any;

if (dataNasc.length === 10) {
  const partes = dataNasc.split('/');
  const dataConvertida = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
  data = Timestamp.fromDate(dataConvertida);
}

  const finalizar = () => {
    if (nome === '' || telefone === '' || data === '') {
      return alert('Preencha todos os campos!');
    } else {
      navigation.navigate('FinalizarCad', { nome, telefone, data });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Cadastre-se</Text>

        <TextInput
          placeholder="Nome completo"
          placeholderTextColor="#999"
          style={styles.input}
          value={nome}
          onChangeText={setNome}
        />
        <MaskInput
          value={telefone}
          style={styles.input}
          keyboardType='phone-pad'
          onChangeText={(masked, unmasked) => {
            setTelefone(unmasked);
          }}
          mask={Masks.BRL_PHONE}
          placeholder="Telefone"
          placeholderTextColor="#999"
        />
        <MaskInput
          value={dataNasc}
          style={styles.input}
          keyboardType='phone-pad'
          onChangeText={(masked, unmasked) => {
            setDataNasc(masked);
          }}
          mask={Masks.DATE_DDMMYYYY}
          placeholder="Data de nascimento"
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.button} onPress={finalizar}>
          <Text style={styles.buttonText}>Finalizar cadastro</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF2F5',
    justifyContent: 'center',
  },
  container: {
    paddingHorizontal: 30,
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#C9184A',
    marginBottom: 30,
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
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
