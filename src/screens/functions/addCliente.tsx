import colors from '@/src/colors';
import { auth, database } from '@/src/firebaseConfig';
import FormButton from '@/src/FormButton';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { addDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MaskInput, { Masks } from 'react-native-mask-input';
import Toast from 'react-native-toast-message';
import { useClientes } from './ClientesContext';

export default function AddCliente({ navigation }: any) {
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
      clienteId: Date.now().toString(),
      name,
      telefone,
      proc: mapping,
      dataNasc: data,
      statusProc: false,
      foto:
        'https://www.rastelliparis.com.br/cdn/shop/files/259F7269-2915-4F81-B903-B4C3AB1C2E51.jpg?v=1721635769&width=1445'
    };
    const user = auth.currentUser;
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
    setNome('');
    setTelefone('');
    setMapping('');
    setDataNasc(new Date());
    navigation.reset({
        index: 0,
        routes: [{ name: "Tabs" }],
      });
  };

  const [procedimentos, setProcedimentos] = useState<
      Array<{ id: string; procedimento: string }>
    >([]);
  
  useEffect(() => {
      const user = auth.currentUser;
      if (!user) {
        Toast.show({ type: 'error', text1: 'Usuário não autenticado' });
        navigation.navigate('Login');
        return;
      }
  
      const fetchProcedimentos = async () => {
        try {
          const docRef = collection(database, 'user', user.uid, 'Cuidados');
          const q = await getDocs(docRef);
          const procedimentosData = q.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
          if (procedimentosData.length === 0) {
            Toast.show({
              type: 'info',
              text1: 'Cadastre um procedimento antes de preencher o formulário',
              position: "bottom"
            });
          }
          setProcedimentos(procedimentosData);
        } catch (error) {
          console.error('Erro ao buscar procedimentos:', error);
          Toast.show({ type: 'error', text1: 'Erro ao buscar procedimentos' });
        }
      };
  
      fetchProcedimentos();
    }, []);
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 20}}
      >
        <Ionicons
          name="arrow-back"
          size={35}
          color={colors.secondary}
          onPress={() => navigation.goBack()}
        />
        <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.secondary }}>Adicionar Cliente</Text>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <View style={{backgroundColor: colors.cardBackground, padding: 20, borderRadius: 10, width: '90%'}}>
          <Text style={{color: colors.primary, fontSize: 20}}>Nome:</Text>
          <TextInput
            style={{ marginBottom: 10 }}
            placeholder="Digite o nome do cliente"
            value={name}
            onChangeText={setNome}
            onSubmitEditing={() => telefoneRef.current?.focus()}
            ref={telefoneRef}
          />
          <Text style={{ color: colors.primary, fontSize: 20}}>Telefone:</Text>
          <MaskInput
            style={{ marginBottom: 10, color: colors.textDark }}
            mask={Masks.BRL_PHONE}
            placeholder="Digite o telefone do cliente"
            value={telefone}
            onChangeText={setTelefone}
            ref={telefoneRef}
            keyboardType='numeric'
          />
          <Text style={{  color: colors.primary, fontSize: 20}}>Procedimento preferido:</Text>
          <Picker
            selectedValue={mapping}
            onValueChange={(itemValue) => setMapping(itemValue)}
          >
            <Picker.Item label="Selecione o procedimento" value="" />
            {procedimentos.map((procedimento) => (
              <Picker.Item
                key={procedimento.id}
                label={procedimento.procedimento}
                value={procedimento.procedimento}
              />
            ))}
          </Picker>
          
          <Text style={{ color: colors.primary, fontSize: 20}}>Data de Nascimento:</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{alignSelf: 'center', marginBottom: 10, padding: 10}}
          >
            <Text style={{ color: dataNasc ? colors.text : colors.placeholder }}>
              {dataNasc ? dataNasc.toLocaleDateString() : 'Selecione a data'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dataNasc}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDataNasc(selectedDate);
                }
              }}
            />
          )}
          <View style={{ alignContent: 'center', alignItems: 'center' }}>
          <FormButton title="Adicionar" onPress={handleSendForm} maxWidth={250} />
          </View>
        </View>
      </MotiView>
    </SafeAreaView>
  );
}
