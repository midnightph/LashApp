import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddCliente from '../../src/screens/functions/addCliente';
import { useClientes } from '../../src/screens/functions/ClientesContext';
import styles from './styles';
import { database } from '../../src/firebaseConfig';
import { getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { MotiView, MotiText } from 'moti';

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
          console.log('Documento não encontrado');
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
      setIsLoading(true);

      const carregar = async () => {
        await carregarClientes();
        if (isMounted) {
          const atualizados = atualizarUltimosClientes();
          setUltimosClientes(atualizados);
          setIsLoading(false);
        }
      };

      carregar();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  useEffect(() => {
    if (clientes.length > 0) {
      setUltimosClientes(atualizarUltimosClientes());
    }
  }, [clientes, atualizarUltimosClientes]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF2F5' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF2F5" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          {/* Loader por cima com opacidade zero no conteúdo */}
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
                backgroundColor: '#FFF2F5',
              }}
            >
              <ActivityIndicator size="large" color="#FFC0CB" />
            </View>
          )}

          {!isLoading && (
  <ScrollView
    contentContainerStyle={{ flexGrow: 1 }}
    keyboardShouldPersistTaps="handled"
    style={{marginHorizontal: 10}}
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
    style={styles.welcomeText}
  >
    👋 Bem-vindo(a) ao Studio Lash{nome ? ' ' + nome : ''}!
  </MotiText>

  <MotiText
    from={{ opacity: 0, translateY: -10 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ delay: 200, type: 'timing' }}
    style={styles.subtitle}
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
            style={styles.clienteCard}
            onPress={() =>
              navigation.navigate('DetalhesCliente', { cliente: item })
            }>
            <Image source={{ uri: item.foto }} style={styles.clientImage} />
            <Text style={[styles.clienteNome]}>{item.name}</Text>
            <Text style={styles.clienteProcedimento}>{item.proc}</Text>
            <Text style={styles.clienteData}>
              {item.dataNasc.toDate().toLocaleDateString()}
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
    style={{ paddingHorizontal: 15 }}
  >
    <AddCliente />
  </MotiView>
</MotiView>

          </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
