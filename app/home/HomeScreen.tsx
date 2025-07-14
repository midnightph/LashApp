import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { MotiText, MotiView } from 'moti';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';

import colors from '@/src/colors';
import { database } from '../../src/firebaseConfig';
import AddCliente from '../../src/screens/functions/addCliente';
import { useClientes } from '../../src/screens/functions/ClientesContext';

export default function App({ navigation }: any) {
  const { clientes, carregarClientes, atualizarUltimosClientes } = useClientes();
  const insets = useSafeAreaInsets();
  const [ultimosClientes, setUltimosClientes] = useState([]);
  const [nome, setNome] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) return;

        const docRef = doc(database, 'user', user.uid);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const dados = snapshot.data();
          setNome(dados.nome);
        } else {
          console.error('Documento não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar cliente do usuário logado:', error);
      }
    };

    fetchClientes();
  }, []);

  useFocusEffect(
  useCallback(() => {
    let isMounted = true;

    const carregar = async () => {
      try {
        await carregarClientes(); // atualiza clientes no contexto
      } catch (error) {
        if (isMounted) {
          Toast.show({
            type: 'error',
            text1: 'Erro ao carregar clientes: ' + error,
            position: 'bottom',
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    carregar();

    return () => {
      isMounted = false;
    };
  }, [])
);

// Atualiza ultimosClientes e salva no AsyncStorage sempre que clientes mudar
useEffect(() => {
  if (clientes.length > 0) {
    const atualizados = atualizarUltimosClientes();
    setUltimosClientes(atualizados);
    AsyncStorage.setItem('ultimosClientes', JSON.stringify(atualizados));
  }
}, [clientes, atualizarUltimosClientes]);


  useEffect(() => {
    if (clientes.length > 0) {
      setUltimosClientes(atualizarUltimosClientes());
    }
  }, [clientes, atualizarUltimosClientes]);

  return (
    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 500 }} style={{ flex: 1 }}>
    <ImageBackground
      source={require('../images/background.png')}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
    <SafeAreaView style={{ flex: 1}}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          {isLoading && (
            <View
              style={{
                position: 'absolute',
                zIndex: 2,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="always"
            >
              <MotiView
                from={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 500 }}
                style={[styles.container, { paddingTop: insets.top }]}
              >
                <MotiText
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 100, type: 'timing' }}
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: colors.secondary,
                    marginBottom: 8, 
                    marginHorizontal: 15
                  }}
                >
                  👋 Bem-vindo(a) ao Studio Lash!
                </MotiText>

                <MotiText
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 200, type: 'timing' }}
                  style={{
                    fontSize: 16,
                    color: colors.textDark,
                    marginBottom: 4,
                    marginHorizontal: 15
                  }}
                >
                  Últimos clientes atendidos:
                </MotiText>

                <View style={{ paddingTop: 10 }}>
                  <FlatList
                    horizontal
                    data={ultimosClientes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                      <MotiView
                        from={{ opacity: 0, translateX: 50 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        transition={{ delay: 300 + index * 100, type: 'timing' }}
                      >
                        <TouchableOpacity
                          style={styles.cardCliente}
                          onPress={() =>
                            navigation.navigate('DetalhesCliente', { cliente: item })
                          }
                        >
                          <Image source={{ uri: item.foto }} style={styles.clientImage} />
                          <Text style={[styles.clienteNome]}>{item.name.split(' ').slice(0, 2).join(' ')}</Text>
                          <Text style={styles.clienteProcedimento}>{item.proc}</Text>
                          <Text style={styles.clienteData}>
                            {new Date(item.dataNasc.seconds * 1000).toLocaleDateString()}
                          </Text>
                          {item.statusProc && (
                            <Text style={styles.clienteAtendimento}>Em atendimento</Text>
                          )}
                        </TouchableOpacity>
                      </MotiView>
                    )}
                    contentContainerStyle={styles.listContainer}
                    showsHorizontalScrollIndicator={false}
                  />
                </View>

                <MotiView
                  from={{ opacity: 0, translateY: 50 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 600, type: 'timing' }}
                  style={{ paddingHorizontal: 30 }}
                >
                  <AddCliente />
                </MotiView>
              </MotiView>
            </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </ImageBackground>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  cardCliente: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 15,
    width: 200,
    height: 250,
    marginBottom: 5,
    marginRight: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary
  },
  clientImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  clienteNome: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clienteProcedimento: {
    color: colors.title,
    fontSize: 14,
  },
  clienteData: {
    color: colors.title,
    fontSize: 12,
    marginTop: 6,
  },
  clienteAtendimento: {
    color: colors.success,
    fontSize: 12,
    marginTop: 2,
  },
  listContainer: {
    paddingLeft: 15,
  },
});
