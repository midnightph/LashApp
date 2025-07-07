import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState('');

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={day => {
          setSelectedDate(day.dateString);
        }}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: '#333',
          },
        }}
        theme={{
          selectedDayBackgroundColor: '#333',
          todayTextColor: '#333',
          arrowColor: '#333',
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
