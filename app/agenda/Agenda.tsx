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
  TouchableOpacity
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function Agenda({ navigation }: any) {
  const [selectedDate, setSelectedDate] = useState('');
  const [agendamentos, setAgendamentos] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [todosAgendamentos, setTodosAgendamentos] = useState([]);
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
      querySnapshot.forEach(doc => {
        const data = doc.data().data?.toDate();
        if (data) {
          const dateStr = data.toISOString().split('T')[0];
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
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Excluir',
        onPress: () => confirmarExclusao(item),
        style: 'destructive',
      },
      {
        text: 'Confirmar via WhatsApp',
        onPress: () =>
          Linking.openURL(
            `https://wa.me/55${item.telefone.replace(
              /\D/g,
              ''
            )}?text=Olá ${item.nomeCliente
              .split(' ')
              .slice(0, 2)
              .join(
                ' '
              )}, podemos confirmar o seu horário no dia ${item.data
              .toDate()
              .toLocaleString()
              .slice(0, 10)} às ${item.data
              .toDate()
              .toLocaleString()
              .slice(11, 16)}? 😊`
          ),
        style: 'default',
      },
    ]);
  };

  const confirmarExclusao = (item: any) => {
    Alert.alert('Confirmar exclusão', 'Deseja realmente excluir esse agendamento?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Sim',
        onPress: () => excluir(item),
        style: 'destructive',
      },
    ]);
  };

  const excluir = async (item: any) => {
    const uid = user?.uid;
    const agendamentoRef = doc(database, 'user', uid!, 'Agendamentos', item.id);

    try {
      await deleteDoc(agendamentoRef);
      Toast.show({
        type: 'success',
        text1: 'Agendamento excluído com sucesso',
        position: 'bottom',
      });
      setAgendamentos(prev => prev.filter(a => a.id !== item.id));
      setTodosAgendamentos(prev => prev.filter(a => a.id !== item.id));
    } catch (e) {
      console.log(e);
      Toast.show({
        type: 'error',
        text1: 'Erro ao excluir agendamento',
        position: 'bottom',
      });
    }
  };

  const agendamentosFiltrados = searchTerm.trim()
    ? todosAgendamentos.filter(agendamento =>
        agendamento.nomeCliente
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase())
      )
    : agendamentos;

  return (
    <ImageBackground
      source={require('../images/background.png')}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe}>
        <MotiView
          style={styles.header}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 1000 }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color={colors.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>Agenda</Text>

          <TouchableOpacity onPress={fetchAgendamentos}>
            <Ionicons name="refresh" size={28} color={colors.primary} />
          </TouchableOpacity>
        </MotiView>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cliente..."
          placeholderTextColor="#999"
          value={searchTerm}
          onChangeText={setSearchTerm}
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
            selectedDayBackgroundColor: colors.background,
            todayTextColor: '#333',
            arrowColor: colors.primary,
            monthTextColor: colors.text,
          }}
        />

        {agendamentosFiltrados.length > 0 ? (
          <MotiView
            style={styles.infoContainer}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 1000 }}
          >
            <Text style={styles.infoText}>Agendamentos:</Text>
            {agendamentosFiltrados.map((agendamento, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => openOptions(agendamento)}
                style={styles.agendamentoItem}
              >
                <FontAwesome name="whatsapp" size={20} color="#25D366" />
                <Text style={styles.dateText}>
                  {agendamento.nomeCliente
                    .split(' ')
                    .slice(0, 2)
                    .join(' ')}{' '}
                  - {agendamento.mapping} -{' '}
                  {agendamento.data.toDate().toLocaleString().slice(0, 16)}
                </Text>
              </TouchableOpacity>
            ))}
          </MotiView>
        ) : (
          <MotiView
            style={styles.infoContainer}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 1000 }}
          >

          </MotiView>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.primary,
  },
  calendar: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary,
    marginHorizontal: 16,
    marginTop: 10,
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
  infoContainer: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  infoText: {
    fontSize: 18,
    color: colors.textDark,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    color: colors.textDark,
    marginLeft: 8,
  },
  agendamentoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
});