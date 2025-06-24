import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useClientes } from './ClientesContext';
import styles from './styles';
import { getAuth } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { database } from '@/src/firebaseConfig';
import MaskInput, { Masks } from 'react-native-mask-input';
import Toast from 'react-native-toast-message';

export default function AddCliente({ navigation }: any) {
  const [showForm, setShowForm] = useState(false);
  const [name, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mapping, setMapping] = useState('');
  const [dataNasc, setDataNasc] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { limparClientes, carregarClientes } = useClientes();


  const { adicionarCliente } = useClientes();

  const handleSendForm = async () => {
    if (name.length < 3 || telefone.length < 10 || mapping.length < 3) {
      Alert.alert('Preencha todos os campos corretamente!');
      return;
    }

    const novoCliente = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      telefone,
      proc: mapping,
      dataNasc: dataNasc.toLocaleDateString('pt-BR'),
      historico: [],
      statusProc: false,
      foto: 'https://www.rastelliparis.com.br/cdn/shop/files/259F7269-2915-4F81-B903-B4C3AB1C2E51.jpg?v=1721635769&width=1445'
    };
    const user = getAuth().currentUser;
    if (!user) return;

    try {
      await addDoc(collection(database, 'user', user.uid, 'Clientes'), novoCliente);
      Toast.show({
        text1: 'Cliente adicionado com sucesso!',
        position: 'bottom'
      })
      limparClientes()
      await carregarClientes()
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      return;
    }

    setShowForm(false);
    setNome('');
    setTelefone('');
    setMapping('');
    setDataNasc(new Date());
  };

  return (
    <View style={styles.boxAddCliente}>
      <TouchableOpacity
        style={styles.bigButton}
        onPress={() => setShowForm(!showForm)}
      >
        <Text style={styles.bigButtonText}>+ Novo Cliente</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.formContainer}>
          <Text style={styles.textInput}>Nome da cliente</Text>
          <TextInput
            placeholder="Digite aqui"
            value={name}
            onChangeText={setNome}
            style={styles.input}
            placeholderTextColor="#888"
          />

          <Text style={styles.textInput2}>Telefone</Text>
          <MaskInput
            value={telefone}
            style={styles.input}
            onChangeText={(masked, unmasked) => {
              setTelefone(unmasked);
            }}
            mask={Masks.BRL_PHONE}
          />

          <Text style={styles.textInput2}>Mapping preferido</Text>
          <TextInput
            placeholder="Esquilo, volume brasileiro..."
            value={mapping}
            onChangeText={setMapping}
            style={styles.input}
          />

          <Text style={styles.textInput2}>Data de nascimento</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[styles.input, { justifyContent: 'center' }]}
          >
            <Text style={[styles.input, { marginLeft: 5 }, { color: '#888' }]}>{dataNasc.toLocaleDateString('pt-BR')}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dataNasc}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              locale="pt-BR"
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') setShowDatePicker(false);
                if (selectedDate) setDataNasc(selectedDate);
              }}
            />
          )}

          <TouchableOpacity
            style={styles.sendForm}
            onPress={handleSendForm}
          >
            <Text>Enviar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
