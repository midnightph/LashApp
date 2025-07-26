import colors from '@/src/colors';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { collection, getDocs } from 'firebase/firestore';
import { database } from '@/src/firebaseConfig';

export default function InfoClientes({ navigation }: any) {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });

  const user = getAuth().currentUser;
  if (!user) {
    navigation.navigate('Login');
    return null;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const faturamentoRef = collection(database, 'user', user.uid, 'Faturamento');
        const snapshot = await getDocs(faturamentoRef);
        const data = snapshot.docs.map(doc => ({
          id: doc.id, // semanaId tipo "2025-30"
          ...doc.data()
        }));

        // Ordenar por semanaId
        data.sort((a, b) => (a.id > b.id ? 1 : -1));

        const labels = data.map(item => {
          const partes = item.id.split('-');
          return `Sem ${partes[1]}`; // Ex: "Sem 30"
        });

        const valores = data.map(item => item.valor);

        setChartData({
          labels,
          datasets: [{ data: valores }],
        });
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <MotiView
        style={{ padding: 20, flexDirection: 'row', alignItems: 'center' }}
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 800 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={35} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.secondary, marginLeft: 10 }}>
          Informações
        </Text>
      </MotiView>

        {chartData.labels.length > 0 ? (
      <MotiView
        style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}
        from={{ opacity: 0, translateY: -50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 1500 }}
      >
        
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            yAxisLabel="R$"
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 2,
              color: (opacity = 1) => colors.secondary,
              labelColor: (opacity = 1) => '#333',
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: colors.primary,
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        

        <Text style={{ fontSize: 18, color: colors.secondary, textAlign: 'center', marginTop: 20, maxWidth: '80%' }}>
          Aqui você pode visualizar as informações de faturamento.
        </Text>
      </MotiView>
      ) : (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}/>

        )}
    </SafeAreaView>
  );
}
