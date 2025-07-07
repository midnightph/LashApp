import colors from '@/src/colors';
import { database, getHistoricoUsuario } from '@/src/firebaseConfig';
import FormButton from '@/src/FormButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, Timestamp, updateDoc } from 'firebase/firestore';
import { deleteObject, getStorage, listAll, ref } from 'firebase/storage';
import { MotiView } from 'moti';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, ImageBackground, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useClientes } from '../../src/screens/functions/ClientesContext';
import { gerarReciboPDF } from '../../src/screens/functions/gerarRecibo';

export default function DetalhesCliente({ route, navigation }: any) {
  const { cliente } = route.params;
  const { atualizarAtendimento, carregarClientes, limparClientes } = useClientes();

  const [atendimento, setAtendimento] = useState(cliente.statusProc ?? false);
  const [valor, setValor] = useState<string | undefined>();
  const [observacoes, setObservacoes] = useState('');
  const [mapping, setMapping] = useState('');
  const [modalShown, setModalShown] = useState(false);
  const [modalShown1, setModalShown1] = useState(false);

  const [imagem, setImagem] = useState(cliente.foto);
  const [historicoComId, setHistoricoComId] = useState<any[]>([]);

  const [showDataPicker, setShowDataPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [dateWithTime, setDateWithTime] = useState<Date | null>(null); // variável global data+hora combinadas

  const [inputFocused, setInputFocused] = useState(false);
  const [inputFocused2, setInputFocused2] = useState(false);
  const [inputFocused3, setInputFocused3] = useState(false);

  const valorRef = useRef<TextInput>(null);
  const observacoesRef = useRef<TextInput>(null);

  useEffect(() => {
    async function fetchHistoricoComId() {
      try {
        const historico = await getHistoricoUsuario(cliente.id);
        setHistoricoComId(historico);
      } catch (e) {
        console.error('Erro ao buscar histórico:', e);
      }
    }
    fetchHistoricoComId();
  }, []);

  const agendar = async (data: Date) => {
    if (!data || !mapping || !valor) {
      return Toast.show({ type: 'error', text1: 'Preencha todos os campos corretamente!', position: 'bottom' });
    }
    const auth = getAuth();
    const user = auth.currentUser;

    const agendamento = {
      data: Timestamp.fromDate(data),
      mapping: mapping,
      observacoes: observacoes || '',
      valor: valor,
    };

    try {
      await addDoc(collection(database, 'user', user.uid, 'Agendamentos'), agendamento);
      setValor('');
      setObservacoes('');
      setMapping('');
      setDateWithTime(null);
      Toast.show({ type: 'info', text1: 'Agendamento realizado com sucesso!', position: 'bottom' });
      limparClientes();
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
    } catch (error) {
      console.log(error);
      Toast.show({ type: 'error', text1: 'Erro ao realizar agendamento', position: 'bottom' });
    }
  };

  const atualizarProc = async (proc: boolean) => {
    const auth = getAuth();
    const user = auth.currentUser;

    const novoHistorico = {
      data: Timestamp.now(),
      mapping: mapping,
      observacoes: observacoes,
      valor: valor,
      foto: 'https://www.rastelliparis.com.br/cdn/shop/files/259F7269-2915-4F81-B903-B4C3AB1C2E51.jpg?v=1721635769&width=1445',
    };
    if (!proc) {
      return await updateDoc(doc(database, 'user', user.uid, 'Clientes', cliente.id), { statusProc: proc });
    }
    try {
      await addDoc(collection(database, 'user', user.uid, 'Clientes', cliente.id, 'Historico'), novoHistorico);
      await updateDoc(doc(database, 'user', user.uid, 'Clientes', cliente.id), { statusProc: proc });
      Toast.show({ type: 'info', text1: 'Procedimento atualizado com sucesso!', position: 'bottom' });
      limparClientes();
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
    } catch (error) {
      console.error('Erro ao atualizar procedimento:', error);
    }
  };

  const excluirCliente = async () => {
    const user = getAuth().currentUser;
    const storage = getStorage();
    const pastaCliente = `clientes/${cliente.id}/`;
    const storageRef = ref(storage, pastaCliente);

    try {
      const result = await listAll(storageRef);
      const promises = result.items.map((itemRef) => deleteObject(itemRef));
      await Promise.all(promises);

      const historicoRef = collection(database, 'user', user.uid, 'Clientes', cliente.id, 'Historico');
      const querySnapshot = await getDocs(historicoRef);
      const promisesHistorico = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(promisesHistorico);

      await deleteDoc(doc(database, 'user', user.uid, 'Clientes', cliente.id));

      const agendamentosRef = collection(database, 'user', user.uid, 'Agendamentos');
      const querySnapshotAgendamentos = await getDocs(agendamentosRef);
      const promisesAgendamentos = querySnapshotAgendamentos.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(promisesAgendamentos);

      Toast.show({ type: 'info', text1: 'Cliente excluído com sucesso!', position: 'bottom' });
      limparClientes();
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
    } catch (error) {
      console.error('Erro ao excluir cliente e imagens:', error);
    }
  };

  // Funções para DateTimePicker
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      setShowDataPicker(false);

      const dataSemHora = new Date(selectedDate);
      dataSemHora.setHours(0, 0, 0, 0);

      setDateWithTime(dataSemHora);
      setShowTimePicker(true);
    } else {
      setShowDataPicker(false);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (event.type === 'set' && selectedTime && dateWithTime) {
      const novaData = new Date(dateWithTime);
      novaData.setHours(selectedTime.getHours());
      novaData.setMinutes(selectedTime.getMinutes());
      novaData.setSeconds(0);
      novaData.setMilliseconds(0);

      setDateWithTime(novaData);
      setShowTimePicker(false);

      setModalShown1(true);
    } else {
      setShowTimePicker(false);
    }
  };

  // Confirmar agendamento no modal
  const confirmarAgendamento = async () => {
    if (!dateWithTime || !mapping || !valor) {
      Alert.alert('Erro', 'Preencha todos os campos corretamente.');
      return;
    }
    setModalShown1(false);
    await agendar(dateWithTime);
  };

  return (
    <ImageBackground source={require('../images/background.png')} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 20 }}>
        <MotiView
          style={{ alignItems: 'center', marginTop: 20, flexDirection: 'row', gap: 20, justifyContent: 'center' }}
          from={{ opacity: 0, scale: 0.5, translateY: 50 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
        >
          <Image source={{ uri: imagem }} style={styles.image} />
          <View style={{ flexDirection: 'column', gap: 10 }}>
            <Text style={{ fontSize: 24, color: colors.primary, fontWeight: 'bold', maxWidth: 150 }}>
              {cliente.name.split(' ').slice(0, 2).join(' ')}
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${cliente.telefone}`)}>
              <Text style={{ fontSize: 18, color: colors.title, textDecorationLine: 'underline', fontWeight: 'bold' }}>
                {cliente.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
              </Text>
            </TouchableOpacity>
            {atendimento && <Text style={{ fontSize: 10, color: colors.success, fontWeight: 'bold' }}>Atendimento em andamento</Text>}
          </View>
        </MotiView>

        <View style={{ backgroundColor: colors.cardBackground, padding: 20, borderRadius: 10, marginTop: 20 }}>
          <Text style={{ fontSize: 18, color: colors.title, fontWeight: 'bold', paddingBottom: 10 }}>Últimos atendimentos:</Text>
          <ScrollView style={{ borderTopColor: colors.primary, borderTopWidth: 1, maxHeight: 300 }}>
            {historicoComId.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation.navigate('DetalhesMapping', { item, clienteId: cliente.id, id: item.id })}
                style={{ borderBottomColor: colors.primary, borderBottomWidth: 1, padding: 10 }}
              >
                <Text style={{ color: colors.title, fontWeight: 'bold', fontSize: 16 }}>Mapping: {item.mapping}</Text>
                <Text style={{ color: colors.secondary }}>Valor: {item.valor}</Text>
                <Text style={{ color: colors.secondary }}>Data: {item.data?.toDate().toLocaleDateString()}</Text>
                <Text style={{ color: colors.secondary }}>Observações: {item.observacoes || 'Nenhuma observação'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, justifyContent: 'center' }}>
          <FormButton
            title={atendimento ? 'Encerrar atendimento' : 'Iniciar atendimento'}
            onPress={() => {
              if (!atendimento) {
                setAtendimento(true);
                setModalShown(true);
              } else {
                setAtendimento(false);
                atualizarProc(false);
              }
            }}
            secondary={!atendimento}
            maxWidth={170}
          />
          <FormButton
            title="Excluir cliente"
            onPress={() =>
              Alert.alert('Excluir Cliente', 'Tem certeza que deseja excluir esse cliente?', [
                { text: 'Não', style: 'cancel' },
                { text: 'Excluir', onPress: async () => excluirCliente() },
              ])
            }
            secondary={true}
            maxWidth={170}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, justifyContent: 'center' }}>
          <FormButton title="Agendar" onPress={() => setShowDataPicker(true)} secondary={true} maxWidth={170} />
          <FormButton title="Gerar recibo" onPress={() => gerarReciboPDF(cliente)} secondary={true} maxWidth={170} />

          {showDataPicker && (
            <DateTimePicker
              value={dateWithTime || new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={dateWithTime || new Date()}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}
        </View>

        {/* Modal para iniciar atendimento */}
        {modalShown && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalShown}
              onRequestClose={() => {
                setModalShown(false);
                setAtendimento(false);
              }}
            >
              <View style={{ padding: 20, flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <View
                  style={{
                    backgroundColor: colors.cardBackground,
                    padding: 20,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.secondary,
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 18, color: colors.title }}>Preencha as informações:</Text>
                  <TextInput
                    placeholder="Mapping"
                    value={mapping}
                    onChangeText={setMapping}
                    style={[styles.input, inputFocused && styles.inputFocused]}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onSubmitEditing={() => setTimeout(() => valorRef.current?.focus(), 100)}
                  />
                  <TextInput
                    placeholder="Valor"
                    value={valor}
                    onChangeText={setValor}
                    style={[styles.input, inputFocused2 && styles.inputFocused]}
                    onFocus={() => setInputFocused2(true)}
                    onBlur={() => setInputFocused2(false)}
                    keyboardType="numeric"
                    ref={valorRef}
                    onSubmitEditing={() => setTimeout(() => observacoesRef.current?.focus(), 100)}
                  />
                  <TextInput
                    placeholder="Observações"
                    value={observacoes}
                    onChangeText={setObservacoes}
                    style={[styles.input, inputFocused3 && styles.inputFocused]}
                    onFocus={() => setInputFocused3(true)}
                    onBlur={() => setInputFocused3(false)}
                    ref={observacoesRef}
                    onSubmitEditing={async () => {
                      if (!mapping || !valor) {
                        Alert.alert('Erro', 'Preencha o mapeamento e o valor.');
                        return;
                      }
                      setModalShown(false);
                      atualizarProc(true);
                    }}
                  />
                </View>
              </View>
            </Modal>
          </View>
        )}

        {/* Modal para agendar com data+hora */}
        {modalShown1 && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalShown1}
              onRequestClose={() => setModalShown1(false)}
            >
              <View style={{ padding: 20, flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <View
                  style={{
                    backgroundColor: colors.cardBackground,
                    padding: 20,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.secondary,
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 18, color: colors.title }}>Preencha as informações:</Text>
                  <TextInput
                    placeholder="Mapping"
                    value={mapping}
                    onChangeText={setMapping}
                    style={[styles.input, inputFocused && styles.inputFocused]}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onSubmitEditing={() => setTimeout(() => valorRef.current?.focus(), 100)}
                  />
                  <TextInput
                    placeholder="Valor"
                    value={valor}
                    onChangeText={setValor}
                    style={[styles.input, inputFocused2 && styles.inputFocused]}
                    onFocus={() => setInputFocused2(true)}
                    onBlur={() => setInputFocused2(false)}
                    keyboardType="numeric"
                    ref={valorRef}
                    onSubmitEditing={() => setTimeout(() => observacoesRef.current?.focus(), 100)}
                  />
                  <TextInput
                    placeholder="Observações"
                    value={observacoes}
                    onChangeText={setObservacoes}
                    style={[styles.input, inputFocused3 && styles.inputFocused]}
                    onFocus={() => setInputFocused3(true)}
                    onBlur={() => setInputFocused3(false)}
                    ref={observacoesRef}
                    onSubmitEditing={confirmarAgendamento}
                  />
                  <FormButton title="Confirmar" onPress={confirmarAgendamento} />
                </View>
              </View>
            </Modal>
          </View>
        )}

        <FormButton title="AI" onPress={() => navigation.navigate('Ai', { clienteId: cliente.id })} secondary={false} />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', padding: 20, backgroundColor: '#FFF2F5' },
  image: { width: 180, height: 180, borderRadius: 100, marginBottom: 5 },
  nome: { fontSize: 24, fontWeight: 'bold' },
  input: { backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.secondary, padding: 10, borderRadius: 10, color: colors.primaryDark },
  inputFocused: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.primary, padding: 10, borderRadius: 10 },
});