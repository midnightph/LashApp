import { database } from '@/src/firebaseConfig';
import FormButton from '@/src/FormButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { AnimatePresence, MotiView } from 'moti';
import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import MaskInput, { Masks } from 'react-native-mask-input';
import Toast from 'react-native-toast-message';
import { useClientes } from './ClientesContext';
import styles from './styles';

export default function AddCliente({ navigation }: any) {
  const [showForm, setShowForm] = useState(false);
  const [name, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mapping, setMapping] = useState('');
  const [dataNasc, setDataNasc] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { limparClientes, carregarClientes } = useClientes();
  const telefoneRef = React.useRef<TextInput>(null);
  const mappingRef = React.useRef<TextInput>(null);
  const dataNascRef = React.useRef<TextInput>(null);

  const data = Timestamp.fromDate(dataNasc);

  const handleSendForm = async () => {
    if (name.length < 3 || telefone.length < 10 || mapping.length < 3) {
      Alert.alert('Preencha todos os campos corretamente!');
      return;
    }

    const novoCliente = {
      name,
      telefone,
      proc: mapping,
      dataNasc: data,
      statusProc: false,
      foto:
        'https://www.rastelliparis.com.br/cdn/shop/files/259F7269-2915-4F81-B903-B4C3AB1C2E51.jpg?v=1721635769&width=1445'
    };
    const user = getAuth().currentUser;
    if (!user) return;

    try {
      await addDoc(collection(database, 'user', user.uid, 'Clientes'), novoCliente);
      Toast.show({
        text1: 'Cliente adicionado com sucesso!',
        position: 'bottom'
      });
      limparClientes();
      await carregarClientes();
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


  const tabBarHeight = useBottomTabBarHeight();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: tabBarHeight,
            paddingHorizontal: 0
          }}
        >
          <FormButton title="Adicionar cliente" onPress={() => setShowForm(!showForm)} secondary />
          <AnimatePresence>
            {showForm && (
              <MotiView
                style={styles.formContainer}
                from={{ opacity: 0, translateY: 20 }}
                exit={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 100, type: 'timing' }}
              >
                <Text style={[styles.textInput2, { marginTop: 20 }]}>Nome da cliente</Text>
                <TextInput
                  placeholder="Nome"
                  value={name}
                  onChangeText={setNome}
                  style={styles.input}
                  placeholderTextColor="#888"
                  onSubmitEditing={() => setTimeout(() => telefoneRef.current?.focus(), 100)}
                />

                <Text style={styles.textInput2}>Telefone</Text>
                <MaskInput
                  value={telefone}
                  style={styles.input}
                  keyboardType="phone-pad"
                  onChangeText={(masked, unmasked) => {
                    setTelefone(unmasked);
                  }}
                  mask={Masks.BRL_PHONE}
                  ref={telefoneRef}
                  onSubmitEditing={() => setTimeout(() => mappingRef.current?.focus(), 100)}
                />

                <Text style={styles.textInput2}>Mapping preferido</Text>
                <TextInput
                  placeholder="Esquilo, volume brasileiro..."
                  value={mapping}
                  onChangeText={setMapping}
                  style={styles.input}
                  ref={mappingRef}
                  placeholderTextColor="#888"
                  onSubmitEditing={() => setTimeout(() => dataNascRef.current?.focus(), 100)}
                />

                <Text style={styles.textInput2}>Data de nascimento</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={[styles.input, { justifyContent: 'center' }]}
                >
                  <Text style={{ marginLeft: 5, color: '#888' }}>
                    {dataNasc.toLocaleDateString('pt-BR')}
                  </Text>
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

                <View style={{ paddingVertical: 20 }}>
                  <FormButton title="Enviar" onPress={handleSendForm} secondary />
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
