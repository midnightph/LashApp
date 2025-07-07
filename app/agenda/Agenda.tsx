import colors from '@/src/colors';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState('');

  const user = getAuth().currentUser;

  useEffect(() => {
      if (user) {
        const uid = user.uid;
      }
  }, [selectedDate]);

  return (
    <ImageBackground
      source={require('../images/background.png')}
      style={{ flex: 1 }}
    >
    <SafeAreaView style={styles.container}>
      <Calendar style={{ borderRadius: 20, overflow: 'hidden' }}
        onDayPress={day => {
          setSelectedDate(day.dateString);
        }}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: colors.primary,
          },
        }}
        theme={{
          selectedDayBackgroundColor: colors.background,
          todayTextColor: '#333',
          arrowColor: colors.secondary,
        }}
      />

      {selectedDate ? (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Data selecionada:</Text>
          <Text style={styles.dateText}>{selectedDate}</Text>
        </View>
      ) : (
        <Text style={styles.infoText}>Toque em uma data para ver detalhes.</Text>
      )}
    </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
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
