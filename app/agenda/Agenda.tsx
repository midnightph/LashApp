import colors from '@/src/colors';
import { database } from '@/src/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Agenda({ navigation }: any) {
  const [selectedDate, setSelectedDate] = useState('');
  const [agendamentos, setAgendamentos] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchAgendamentos = async () => {
      if (user && selectedDate) {
        setAgendamentos([]);
        const [year, month, day] = selectedDate.split('-').map(Number);
        // Corrigindo para UTC e ignorando fuso do dispositivo
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
        const data = querySnapshot.docs.map(doc => doc.data());
        setAgendamentos(data);
      }
    };

    fetchAgendamentos();
  }, [selectedDate]);

  useEffect(() => {
    const fecthDiasMarcados = async () => {
      if(!user) return;

      const uid = user.uid;
      const agendamentoRef = collection(database, 'user', uid, 'Agendamentos');

      const querySnapshot= await getDocs(agendamentoRef);
      const marcados: Record<string, any> = {};
      querySnapshot.forEach(doc => {
        const data = doc.data().data?.toDate();
        if(data) {
          const dateStr = data.toISOString().split('T')[0];
          marcados[dateStr] = { marked: true, dotColor: colors.primary };
        }
      })
      setMarkedDates(marcados);
    }

    fecthDiasMarcados();
  }, [user])

  const marked = {};
  agendamentos.forEach((item) => {
    const dateStr = item.data.toDate().toISOString().split('T')[0]; // '2025-07-09'
    marked[dateStr] = { marked: true, dotColor: 'purple' };
  });

  return (
    <ImageBackground
      source={require('../images/background.png')}
      style={{ flex: 1 }}
    >
      <MotiView style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 20, gap: 10 }} from={{opacity: 0}} animate={{opacity: 1}} transition={{type: 'timing', duration: 1000}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={35} color={colors.primary} />
            </TouchableOpacity>
            <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.primary }}>Agenda</Text>
        </MotiView>
      <SafeAreaView style={styles.container}>
        <Calendar style={{ borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.primary }}
          onDayPress={day => {
            setSelectedDate(day.dateString);
          }}
          markedDates={markedDates}
          theme={{
            selectedDayBackgroundColor: colors.background,
            todayTextColor: '#333',
            arrowColor: colors.primary,
            monthTextColor: colors.tex,
          }}
        />

        {selectedDate && agendamentos.length > 0 ? (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Agendamentos:</Text>
            {agendamentos.map((agendamento, index) => (
              <Text key={index} style={styles.dateText}>
                {agendamento.nomeCliente.split(' ').slice(0, 2).join(' ')} -{' '}
                {agendamento.mapping.split(' ')} -{' '}
                {agendamento.data.toDate().toLocaleString().slice(11, 16)}
              </Text>
            ))}
          </View>
        ) : (
          selectedDate && (
            <ActivityIndicator size="large" color={colors.secondary} style={{ marginTop: 24 }} />
          )
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingVertical: 24,
  },
  infoContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 8,
  },
});
