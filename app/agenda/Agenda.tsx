import colors from '@/src/colors';
import { database } from '@/src/firebaseConfig';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { MotiView } from 'moti';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function Agenda({ navigation }: any) {
  const [selectedDate, setSelectedDate] = useState('');
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [todosAgendamentos, setTodosAgendamentos] = useState<any[]>([]);
  const user = getAuth().currentUser;

  const fetchTodosAgendamentos = useCallback(async () => {
    if (!user) return;
    const uid = user.uid;
    const agendamentoRef = collection(database, 'user', uid, 'Agendamentos');
    const querySnapshot = await getDocs(agendamentoRef);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTodosAgendamentos(data);
  }, [user]);

  const fetchAgendamentos = useCallback(async () => {
    if (user && selectedDate) {
      setAgendamentos([]);
      const [year, month, day] = selectedDate.split('-').map(Number);
      const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

      const uid = user.uid;
      const agendamentoRef = collection(database, 'user', uid, 'Agendamentos');

      const q = query(
        agendamentoRef,
        where('data', '>=', Timestamp.fromDate(start)),
        where('data', '<=', Timestamp.fromDate(end))
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.data.seconds - b.data.seconds);

      setAgendamentos(data);

      if (data.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'Nenhum agendamento encontrado',
          position: 'bottom',
        });
      }
    }
  }, [user, selectedDate]);

  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  useEffect(() => {
    const fecthDiasMarcados = async () => {
      if (!user) return;

      const uid = user.uid;
      const agendamentoRef = collection(database, 'user', uid, 'Agendamentos');

      const querySnapshot = await getDocs(agendamentoRef);
      const marcados: Record<string, any> = {};

      querySnapshot.forEach(async doc1 => {
        const data = doc1.data().data?.toDate();
        if (data) {
          const dateStr = data.toISOString().split('T')[0];
          if (data < new Date()) {
            // Exclui agendamentos passados para manter calendário limpo
            await deleteDoc(doc(database, 'user', uid, 'Agendamentos', doc1.id));
            return;
          }
          marcados[dateStr] = { marked: true, dotColor: colors.primary };
        }
      });
      setMarkedDates(marcados);
    };

    fecthDiasMarcados();
    fetchTodosAgendamentos();
  }, [user, fetchTodosAgendamentos]);

  const openOptions = (item: any) => {
    Alert.alert('Opções', 'Escolha o que fazer', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        onPress: () => confirmarExclusao(item),
        style: 'destructive',
      },
      {
        text: 'Confirmar via WhatsApp',
        onPress: () => {
          const telefoneLimpo = item.telefone.replace(/\D/g, '');
          const nomeClienteCurto = item.nomeCliente.split(' ').slice(0, 2).join(' ');
          const dataFormatada = item.data.toDate().toLocaleDateString();
          const horaFormatada = item.data.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          Linking.openURL(
            `https://wa.me/55${telefoneLimpo}?text=Olá ${nomeClienteCurto}, podemos confirmar o seu horário no dia ${dataFormatada} às ${horaFormatada}? 😊`
          );
        },
        style: 'default',
      },
    ]);
  };

  const confirmarExclusao = (item: any) => {
    Alert.alert('Confirmar exclusão', 'Deseja realmente excluir esse agendamento?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sim', onPress: () => excluir(item), style: 'destructive' },
    ]);
  };

  const excluir = async (item: any) => {
    const uid = user?.uid;
    if (!uid) return;

    const agendamentoRef = doc(database, 'user', uid, 'Agendamentos', item.id);
    try {
      await deleteDoc(agendamentoRef);
      Toast.show({
        type: 'success',
        text1: 'Agendamento excluído com sucesso',
        position: 'bottom',
      });
      setAgendamentos((prev) => prev.filter(a => a.id !== item.id));
      setTodosAgendamentos((prev) => prev.filter(a => a.id !== item.id));
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao excluir agendamento',
        position: 'bottom',
      });
    }
  };

  const agendamentosFiltrados = searchTerm.trim()
    ? todosAgendamentos.filter(agendamento =>
        agendamento.nomeCliente.toLowerCase().includes(searchTerm.trim().toLowerCase())
      )
    : agendamentos;

  return (
    <ImageBackground source={require('../images/background.png')} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
          keyboardVerticalOffset={90}
        >
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
            <MotiView
              style={styles.header}
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 1000 }}
            >
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton} accessibilityLabel="Voltar">
                <Ionicons name="arrow-back" size={30} color={colors.secondary} />
              </TouchableOpacity>

              <Text style={styles.title}>Agenda</Text>

              <TouchableOpacity onPress={fetchAgendamentos} style={styles.iconButton} accessibilityLabel="Atualizar agenda">
                <Ionicons name="refresh" size={28} color={colors.secondary} />
              </TouchableOpacity>
            </MotiView>

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar cliente..."
              placeholderTextColor="#999"
              value={searchTerm}
              onChangeText={setSearchTerm}
              accessibilityLabel="Campo de busca por cliente"
            />

            <Calendar
              style={styles.calendar}
              onDayPress={day => setSelectedDate(day.dateString)}
              markedDates={{
                ...markedDates,
                ...(selectedDate && {
                  [selectedDate]: {
                    ...(markedDates[selectedDate] || {}),
                    selected: true,
                    selectedColor: colors.primary,
                  },
                }),
              }}
              theme={{
                selectedDayBackgroundColor: colors.primary,
                todayTextColor: colors.secondary,
                arrowColor: colors.secondary,
                monthTextColor: colors.text,
                textDayFontWeight: '600',
              }}
              accessibilityLabel="Calendário de agendamentos"
            />

            <View style={styles.listContainer}>
              {agendamentosFiltrados.length > 0 ? (
                <>
                  <Text style={styles.sectionTitle}>Agendamentos:</Text>
                  {agendamentosFiltrados.map((agendamento) => (
                    <TouchableOpacity
                      key={agendamento.id}
                      onPress={() => openOptions(agendamento)}
                      style={styles.agendamentoItem}
                      accessibilityRole="button"
                      accessibilityLabel={`Opções para agendamento de ${agendamento.nomeCliente}`}
                    >
                      <FontAwesome name="whatsapp" size={20} color="#25D366" />
                      <Text style={styles.agendamentoText}>
                        {agendamento.nomeCliente.split(' ').slice(0, 2).join(' ')} - {agendamento.procedimento} -{' '}
                        {agendamento.data.toDate().toLocaleString().slice(0, 16)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </>
              ) : (
                <View style={styles.noAgendamentosContainer}>
                  <Text style={styles.noAgendamentosText}>Nenhum agendamento encontrado.</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 10,
  },
  iconButton: { padding: 5 },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  searchInput: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    color: colors.text,
    backgroundColor: 'white',
  },
  calendar: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.secondary,
    marginHorizontal: 16,
    marginTop: 10,
  },
  listContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 12,
  },
  agendamentoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  agendamentoText: {
    fontSize: 16,
    color: colors.textDark,
    marginLeft: 8,
    flexShrink: 1,
  },
  noAgendamentosContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  noAgendamentosText: {
    fontSize: 16,
    color: colors.title,
    fontStyle: 'italic',
  },
});
