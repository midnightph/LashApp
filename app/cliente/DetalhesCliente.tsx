import colors from '@/src/colors';
import { database, getHistoricoUsuario } from '@/src/firebaseConfig';
import FormButton from '@/src/FormButton';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { deleteObject, getStorage, ref } from 'firebase/storage';
import { MotiView } from 'moti';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useClientes } from '../../src/screens/functions/ClientesContext';
import { gerarReciboPDF } from '../../src/screens/functions/gerarRecibo';
import { EllipsisVertical } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Picker } from '@react-native-picker/picker';

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

  const [dateWithTime, setDateWithTime] = useState<Date | null>(null);

  const [inputFocused, setInputFocused] = useState(false);
  const [inputFocused2, setInputFocused2] = useState(false);
  const [inputFocused3, setInputFocused3] = useState(false);

  const valorRef = useRef<TextInput>(null);
  const observacoesRef = useRef<TextInput>(null);

  const [clienteFiel, setClienteFiel] = useState(false);
  const [loading, setLoading] = useState(false);

  const [procedimento, setProcedimento] = useState([]);
  const [procedimentoSelecionado, setProcedimentoSelecionado] = useState('');

  useEffect(() => {
    async function fetchHistoricoComId() {
      setLoading(true);
      try {
        const historico = await getHistoricoUsuario(cliente.id);
        const user = getAuth().currentUser;

        if (!user) {
          Toast.show({ type: 'error', text1: 'Usuário não autenticado', position: 'bottom' });
          navigation.navigate('Login');
          return;
        }

        const procedimentoRef = collection(database, 'user', user.uid, 'Cuidados');
        const procedimentoSnapshot = await getDocs(procedimentoRef);

        const procedimentos = procedimentoSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];

        setProcedimento(procedimentos);

        // Ordena por data decrescente e filtra os que têm data
        const ordenado = historico
          .filter(h => h.data)
          .sort((a, b) => b.data.toDate() - a.data.toDate());

        setHistoricoComId(ordenado);

        if (ordenado.length >= 3) {
          const quatroMesesAtras = new Date();
          quatroMesesAtras.setMonth(quatroMesesAtras.getMonth() - 4);

          const ultimosTres = ordenado.slice(0, 3);
          const todosDentroDoPrazo = ultimosTres.every(
            item => item.data.toDate() >= quatroMesesAtras
          );

          setClienteFiel(todosDentroDoPrazo);
        }
      } catch (e) {
        console.error('Erro ao buscar histórico:', e);
      } finally {
        setLoading(false);
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
      clienteId: cliente.clienteId,
      nomeCliente: cliente.name,
      procedimento: procedimentoSelecionado,
      data: Timestamp.fromDate(data),
      mapping: mapping,
      observacoes: observacoes || '',
      valor: valor,
      telefone: cliente.telefone,
    };

    if (data < new Date()) {
      return Toast.show({ type: 'error', text1: 'Data inválida', position: 'bottom' });
    }

    try {
      await addDoc(collection(database, 'user', user.uid, 'Agendamentos'), agendamento);
      setValor('');
      setObservacoes('');
      setMapping('');
      setDateWithTime(null);
      Toast.show({ type: 'info', text1: 'Agendamento realizado com sucesso!', position: 'bottom' });
      limparClientes();
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
      procedimento: procedimentoSelecionado,
      mapping: mapping,
      observacoes: observacoes,
      valor: valor,
      foto: 'https://www.rastelliparis.com.br/cdn/shop/files/259F7269-2915-4F81-B903-B4C3AB1C2E51.jpg?v=1721635769&width=1445',
    };

    if (!proc) {
      await updateDoc(doc(database, 'user', user.uid, 'Clientes', cliente.id), { statusProc: proc });
      return;
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
  if (!user?.uid) {
    return Toast.show({ type: 'error', text1: 'Erro ao excluir cliente', position: 'bottom' });
  }

  if (!cliente?.id || !cliente?.clienteId) {
    console.error('Dados do cliente incompletos:', cliente);
    return Toast.show({ type: 'error', text1: 'Cliente inválido', position: 'bottom' });
  }

  const storage = getStorage();

  try {
    // 1) Excluir arquivos apontados no histórico (que contêm fullPath)
    const histRef = collection(
      database,
      'user',
      user.uid,
      'Clientes',
      cliente.id,
      'Historico'
    );
    const histSnap = await getDocs(histRef);
    const pathsToDelete: string[] = [];
    histSnap.docs.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.fotoPath) {
        pathsToDelete.push(data.fotoPath as string);
      }
    });

    // Executa exclusão de cada arquivo no Storage
    await Promise.all(
      pathsToDelete.map((fullPath) => {
        const fileRef = ref(storage, fullPath);
        return deleteObject(fileRef).catch((err) => {
          console.error(`Falha ao apagar ${fullPath}:`, err.code, err.message);
        });
      })
    );

    // 2) Excluir assinatura, se existir
    const assinaturaPath = `user/${user.uid}/Assinaturas/${cliente.id}.png`;
    const assinaturaRef = ref(storage, assinaturaPath);
    await deleteObject(assinaturaRef).catch((err: any) => {
      if (err.code === 'storage/object-not-found') {

      } else {
        console.error(`Erro ao excluir assinatura:`, err.code, err.message);
      }
    });

    // 3) Excluir histórico Firestore
    await Promise.all(histSnap.docs.map((d) => deleteDoc(d.ref)));

    // 4) Excluir documento principal do cliente
    await deleteDoc(
      doc(database, 'user', user.uid, 'Clientes', cliente.id)
    );

    // 5) Excluir agendamentos vinculados
    const agendRef = collection(
      database,
      'user',
      user.uid,
      'Agendamentos'
    );
    const q = query(agendRef, where('clienteId', '==', cliente.clienteId));
    const agenSnap = await getDocs(q);
    await Promise.all(agenSnap.docs.map((d) => deleteDoc(d.ref)));

    Toast.show({ type: 'info', text1: 'Cliente excluído com sucesso!', position: 'bottom' });
    limparClientes();
    navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
  } catch (err: any) {
    console.error('Erro geral ao excluir cliente:', err.code, err.message);
    Toast.show({ type: 'error', text1: 'Não foi possível excluir o cliente.', position: 'bottom' });
  }
};



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
    if (!dateWithTime || !mapping || !valor || procedimentoSelecionado === '') {
      Alert.alert('Erro', 'Preencha todos os campos corretamente.');
      return;
    }
    setModalShown1(false);
    await agendar(dateWithTime);
  };

  const iniciarAtendimento = async () => {
    if (!mapping || !valor || procedimentoSelecionado === '') {
      Alert.alert('Erro', 'Preencha todos os campos corretamente.');
      return;
    }
    setModalShown(false);
    await atualizarProc(true);
  };

  const iniciarAtendimentoAgenda = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    const agendamentosRef = collection(database, 'user', user.uid, 'Agendamentos');
    const q = query(agendamentosRef, where('clienteId', '==', cliente.clienteId));
    const querySnapshot = await getDocs(q);

    const agora = new Date();

    // Pega só agendamentos futuros
    const agendamentosFuturos = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(ag => ag.data && ag.data.toDate() > agora)
      .sort((a, b) => a.data.toDate() - b.data.toDate()); // do mais próximo para o mais longe

    const proximo = agendamentosFuturos[0];

    if (!proximo) {
      Toast.show({ type: 'error', text1: 'Nenhum agendamento encontrado.', position: 'bottom' });
      setModalShown(false);
      setAtendimento(false);
      return;
    }

    setMapping(proximo.mapping || '');
    setValor(proximo.valor || '');
    setObservacoes(proximo.observacoes || '');
    setDateWithTime(proximo.data?.toDate?.() || new Date());
    setProcedimentoSelecionado(proximo.procedimento || '');

    // Excluir só o agendamento mais próximo
    const proximoDocRef = doc(database, 'user', user.uid, 'Agendamentos', proximo.id);
    await deleteDoc(proximoDocRef);

    Toast.show({ type: 'info', text1: 'Próximo agendamento carregado!', position: 'bottom' });
  };

  const [menuVisible, setMenuVisible] = useState(false);
  const fecharMenu = () => setMenuVisible(false);

  const verifyFormulário = async () => {
    const user = getAuth().currentUser;
    if (!user) {
      navigation.navigate('Login');
      return;
    }

    const userRef = doc(database, 'user', user.uid, 'Clientes', cliente.id);
    const userSnapshot = await getDoc(userRef);
    const data = userSnapshot.data();

    const formularios = data?.formularioAtendimento;

    if (!formularios || formularios.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Esse cliente não preencheu o formulário.',
        position: 'bottom',
      });
      fecharMenu();
      return;
    }

    if (formularios.length === 1) {
      gerarPDF(data, formularios[0]);
    } else {
      // Criar opções de escolha
      const buttons = formularios.map((form: any, index: number) => ({
        text: `${form.procedimento || 'Procedimento'} - ${index + 1}`,
        onPress: () => gerarPDF(data, form),
      }));

      Alert.alert('Escolha o formulário', 'Selecione qual formulário deseja gerar o PDF:', [
        ...buttons,
        { text: 'Cancelar', style: 'cancel' },
      ]);
    }
  };

  async function gerarPDF(cliente: any, form: any) {
    const nome = cliente?.name || 'Cliente';

    const htmlContent = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #444; }
          p { margin: 4px 0; }
          .assinatura { margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Formulário de Atendimento</h1>
        <p><strong>Cliente:</strong> ${nome}</p>
        <p><strong>Procedimento:</strong> ${form.procedimento || 'Não informado'}</p>
        <p><strong>Possui alergia:</strong> ${form.alergia ? 'Sim' : 'Não'}</p>
        <p><strong>Está grávida:</strong> ${form.gravida ? 'Sim' : 'Não'}</p>
        <p><strong>Usa lentes:</strong> ${form.lentes ? 'Sim' : 'Não'}</p>
        <p><strong>Recebeu cuidados:</strong> ${form.cuidados ? 'Sim' : 'Não'}</p>
        <div class="assinatura">
          <p><strong>Assinatura do cliente:</strong></p>
          <img src="${form.assinaturaURL}" alt="Assinatura" width="300" height="100"/>
        </div>
      </body>
    </html>
  `;

    try {
      setLoadingPDF(true);
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        alert('PDF gerado em: ' + uri);
      }
    } catch (e: any) {
      console.error('Erro ao gerar PDF:', e);
      alert('Erro ao gerar PDF: ' + e.message);
    } finally {
      setLoadingPDF(false);
      fecharMenu();
    }
  }

  const [loadingPDF, setLoadingPDF] = useState(false);

  return (
    <ImageBackground source={require('../images/background.png')} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 20 }}>
        <MotiView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 }} from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 1000 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={35} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.secondary }}>Detalhes Cliente</Text>
          <TouchableOpacity style={{ position: 'absolute', right: 0 }} onPress={() => setMenuVisible(true)}>
            <EllipsisVertical size={30} color={colors.secondary} />
          </TouchableOpacity>
        </MotiView>



        <MotiView
          style={{ alignItems: 'center', marginTop: 20, flexDirection: 'row', gap: 20, justifyContent: 'center' }}
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 1500 }}
        >{loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <>
            <Image source={{ uri: imagem }} style={styles.image} />
            <View style={{ flexDirection: 'column', gap: 10 }}>
              {clienteFiel ? (
                <>
                  <Text style={{ fontSize: 24, color: '#FFD700', fontWeight: 'bold' }}>{cliente.name.split(' ').slice(0, 2).join(' ')}</Text>
                  <Text style={{ fontSize: 16, color: colors.secondary, fontWeight: 'bold' }}>Cliente fiel</Text>
                </>
              ) : (
                <Text style={{ fontSize: 24, color: colors.primary, fontWeight: 'bold', maxWidth: 150 }}>
                  {cliente.name.split(' ').slice(0, 2).join(' ')}
                </Text>
              )
              }
              <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${cliente.telefone}`)}>
                <Text style={{ fontSize: 18, color: colors.title, textDecorationLine: 'underline' }}>
                  {cliente.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
                </Text>
              </TouchableOpacity>
              {atendimento && <Text style={{ fontSize: 10, color: colors.success, fontWeight: 'bold' }}>Atendimento em andamento</Text>}
            </View>
          </>
        )}

        </MotiView>

        <MotiView style={{ backgroundColor: colors.cardBackground, padding: 20, borderRadius: 10, marginTop: 20, borderWidth: 1, borderColor: colors.primary }} from={{ opacity: 0, translateY: 50 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 1500 }}>
          <Text style={{ fontSize: 18, color: colors.textDark, paddingBottom: 10 }}>Últimos atendimentos:</Text>
          <ScrollView style={{ borderTopColor: colors.primary, borderTopWidth: 1, maxHeight: 250 }}>
            {historicoComId.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation.navigate('DetalhesMapping', { item, clienteId: cliente.id, id: item.id })}
                style={{ borderBottomColor: colors.primary, borderBottomWidth: 1, padding: 10 }}
              >
                <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Procedimento: {item.procedimento}</Text>
                <Text style={{ color: colors.textDark }}>Valor: {item.valor}</Text>
                <Text style={{ color: colors.textDark }}>Data: {item.data?.toDate().toLocaleDateString()}</Text>
                <Text style={{ color: colors.textDark }}>Observações: {item.observacoes || 'Nenhuma observação'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </MotiView>

        <MotiView from={{ opacity: 0, translateY: 50 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 1250 }} style={{ flexDirection: 'row', gap: 10, marginTop: 20, justifyContent: 'center' }}>
          <FormButton
            title={atendimento ? 'Encerrar atendimento' : 'Iniciar atendimento'}
            onPress={() => {
              if (!atendimento) {
                if (procedimento.length === 0) {
                  return Toast.show({ type: 'info', text1: 'Cadastre um procedimento antes de iniciar o atendimento', position: 'bottom' });
                }
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
        </MotiView>

        <MotiView from={{ opacity: 0, translateY: 50 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 1000 }} style={{ flexDirection: 'row', gap: 10, marginVertical: 10, justifyContent: 'center' }}>
          <FormButton title="Agendar" onPress={() => setShowDataPicker(true)} secondary={true} maxWidth={170} />
          <FormButton title="Gerar recibo" onPress={() => gerarReciboPDF(cliente)} secondary={true} maxWidth={170} />

          {showDataPicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={dateWithTime || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                style={styles.picker}
              />
            </View>
          )}

          {showTimePicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={dateWithTime || new Date()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
                style={styles.picker}
              />
            </View>
          )}
        </MotiView>

        {menuVisible && (
          <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
            <Modal
              visible={menuVisible}
              animationType="fade"
              onRequestClose={fecharMenu}
              style={{ flex: 1 }}
              transparent
            >
              <TouchableOpacity style={{ flex: 1 }} onPress={fecharMenu}>
                <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center' }}>
                  {loadingPDF ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                  ) : (
                    <>
                    <FormButton
                      title="Gerar PDF do formulário"
                      onPress={verifyFormulário}
                      maxWidth={200}
                    />
                    <FormButton
                      title="Editar Cliente"
                      onPress={() => {navigation.navigate('EditarCliente', { cliente }); fecharMenu();}}
                      maxWidth={200}
                      secondary
                    />
                    </>
                  )}

                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        )}


        {modalShown && (
          <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalShown}
              onRequestClose={() => {
                setModalShown(false);
                setAtendimento(false);
              }}
              supportedOrientations={['portrait']} // Bloqueia orientação para portrait (iOS)
              presentationStyle="overFullScreen" // para modal aparecer melhor no iOS
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
                  <Picker
                    selectedValue={procedimentoSelecionado}
                    onValueChange={(itemValue) => setProcedimentoSelecionado(itemValue)}
                    style={{ height: 50, width: '100%', backgroundColor: colors.cardBackground, color: colors.primaryDark, borderWidth: 1, borderColor: colors.secondary, borderRadius: 10 }}
                  >
                    <Picker.Item label="Selecione um procedimento" value="" />
                    {procedimento.map((procedimentos) => (
                      <Picker.Item key={procedimentos.id} label={procedimentos.procedimento} value={procedimentos.procedimento} />
                    ))}
                  </Picker>
                  <TextInput
                    placeholder="Mapping/Formato/Tipo"
                    value={mapping}
                    onChangeText={setMapping}
                    style={[styles.input, inputFocused && styles.inputFocused]}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholderTextColor={colors.textDark}
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
                    placeholderTextColor={colors.textDark}
                    onSubmitEditing={() => setTimeout(() => observacoesRef.current?.focus(), 100)}
                  />
                  <TextInput
                    placeholder="Observações(opcional)"
                    value={observacoes}
                    onChangeText={setObservacoes}
                    style={[styles.input, inputFocused3 && styles.inputFocused]}
                    onFocus={() => setInputFocused3(true)}
                    onBlur={() => setInputFocused3(false)}
                    ref={observacoesRef}
                    placeholderTextColor={colors.textDark}
                  />
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <FormButton title="Agenda" onPress={iniciarAtendimentoAgenda} secondary={true} maxWidth={130} />
                    <FormButton title="Iniciar atendimento" onPress={iniciarAtendimento} maxWidth={185} />
                  </View>
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
              supportedOrientations={['portrait']}
              presentationStyle="overFullScreen"
              style={{ flex: 1 }}
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
                  <Picker
                    selectedValue={procedimentoSelecionado}
                    onValueChange={(itemValue) => setProcedimentoSelecionado(itemValue)}
                    style={{ height: 50, width: '100%', backgroundColor: colors.cardBackground, color: colors.primaryDark, borderWidth: 1, borderColor: colors.secondary, borderRadius: 10 }}
                  >
                    <Picker.Item label="Selecione um procedimento" value="" />
                    {procedimento.map((procedimentos) => (
                      <Picker.Item key={procedimentos.id} label={procedimentos.procedimento} value={procedimentos.procedimento} />
                    ))}
                  </Picker>
                  <TextInput
                    placeholder="Mapping/Formato/Tipo"
                    value={mapping}
                    onChangeText={setMapping}
                    style={[styles.input, inputFocused && styles.inputFocused]}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onSubmitEditing={() => setTimeout(() => valorRef.current?.focus(), 100)}
                    placeholderTextColor={colors.textDark}
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
                    placeholderTextColor={colors.textDark}
                  />
                  <TextInput
                    placeholder="Observações(opcional)"
                    value={observacoes}
                    onChangeText={setObservacoes}
                    style={[styles.input, inputFocused3 && styles.inputFocused]}
                    onFocus={() => setInputFocused3(true)}
                    onBlur={() => setInputFocused3(false)}
                    ref={observacoesRef}
                    placeholderTextColor={colors.textDark}
                  />
                  <FormButton title="Confirmar" onPress={confirmarAgendamento} />
                </View>
              </View>
            </Modal>
          </View>
        )}
        <MotiView style={{ flex: 1, alignItems: 'center' }} from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 1000 }}>
          <FormButton title="AI" onPress={() => navigation.navigate('Ai', { clienteId: cliente.id })} secondary={false} maxWidth={350} />
        </MotiView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', padding: 20, backgroundColor: '#FFF2F5' },
  image: { width: 180, height: 180, borderRadius: 100, marginBottom: 5, borderWidth: 1, borderColor: colors.secondary },
  nome: { fontSize: 24, fontWeight: 'bold' },
  input: { backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.secondary, padding: 10, borderRadius: 10, color: colors.primaryDark },
  inputFocused: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.primary, padding: 10, borderRadius: 10 },
  pickerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    // sombra pra parecer modal deslizando (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10, // para android
  },
  picker: {
    width: '100%',
  },
});