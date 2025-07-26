import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
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
  View
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';

import colors from '@/src/colors';
import { Calendar, CircleUser, FolderCode, NotebookIcon, Search } from 'lucide-react-native';
import { database } from '../../src/firebaseConfig';
import { useClientes } from '../../src/screens/functions/ClientesContext';

export default function App({ navigation }: any) {
  const { clientes, carregarClientes, atualizarUltimosClientes } = useClientes();
  const insets = useSafeAreaInsets();
  const [ultimosClientes, setUltimosClientes] = useState([]);
  const [nome, setNome] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
      alert('Push notifications só funcionam em dispositivos físicos.');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Permissão para notificações negada!');
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  }

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
    registerForPushNotificationsAsync();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const carregar = async () => {
        try {
          await carregarClientes();
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

  useEffect(() => {
    if (clientes.length > 0) {
      const atualizados = atualizarUltimosClientes();
      setUltimosClientes(atualizados);
      AsyncStorage.setItem('ultimosClientes', JSON.stringify(atualizados));
    }
  }, [clientes, atualizarUltimosClientes]);

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
        }
      } catch (error) {
        console.error('Erro ao buscar cliente do usuário logado:', error);
      }
    };

    fetchClientes();
    registerForPushNotificationsAsync();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const carregar = async () => {
        try {
          await carregarClientes();
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

  useEffect(() => {
    if (clientes.length > 0) {
      const atualizados = atualizarUltimosClientes();
      setUltimosClientes(atualizados);
      AsyncStorage.setItem('ultimosClientes', JSON.stringify(atualizados));
    }
  }, [clientes]);

  const [sobrenome, setSobrenome] = useState('');
  const [telefone, setTelefone] = useState('');

  useEffect(() => {
    const fecthNomeEmail = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) return;

        const docRef = doc(database, 'user', user.uid);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const dados = snapshot.data();
          setSobrenome(dados.sobrenome);
          setTelefone(dados.telefone);
        }
      } catch (error) {
        console.error('Erro ao buscar nome e email do usuário:', error);
      }
      
      }
    fecthNomeEmail();
  }, []);

  const pad = () => {
    if(Platform.OS === 'android'){
      return 10
    } else {
      return 
    }
  }

  const padIOS = () => {
    if(Platform.OS === 'ios'){
      return 17
    }
  }

  // ✅ Se ainda está carregando, não renderiza nada além do loader
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }


  return (
    <ImageBackground source={require('../images/background.png')} style={styles.background}>
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.flex1}
      >
        <SafeAreaView style={styles.flex1}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.flex1}
          >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="always">
              <MotiView style={[styles.container, { paddingTop: insets.top + pad() }]}>
                <View style={{ flex:1}}>
                <MotiText
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing' }}
                  style={styles.subtitle}
                >
                  Olá{nome ? `, ${nome}` : ''}!
                </MotiText>
                <MotiText
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing' }}
                  style={styles.title}
                >
                  Bem-vindo(a) ao Bea!
                </MotiText>
                <TouchableOpacity
                  style={{ position: 'absolute', top: 0, right: 20,}}
                  onPress={() => navigation.navigate('Profile', { nome, telefone, sobrenome})}
                >
                <CircleUser size={40} color={colors.secondary} />
                </TouchableOpacity>
                </View>

                {/* Barra de busca */}

                <MotiView
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing' }}
                  style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 15}}
                >
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ClienteScreen')}
                    style={{
                      flex: 1,
                    }}
                  >
                  <Text style={{
                      flex: 1,
                      height: 50,
                      backgroundColor: colors.cardBackground,
                      borderRadius: 20,
                      paddingHorizontal: 45,
                      color: colors.textDark,
                      marginHorizontal: 15,
                      textAlignVertical: 'center',
                      paddingTop: padIOS()
                    }}>Pesquise por nome</Text>
                  <Search size={25} color={colors.primary} style={{position: 'absolute', left: 25, right: 0, top: 13}}/>
                  </TouchableOpacity>
                </MotiView>

                {/* Barra com ícones */}
                <MotiView
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', duration: 250}}
                  style={styles.iconBar}
                >
                  <TouchableOpacity onPress={() => navigation.navigate('Agenda')} style={styles.iconButton}>
                    <Calendar size={28} color={colors.primary} />
                    <Text style={styles.iconLabel}>Agenda</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('Formulario')} style={styles.iconButton}>
                    <FolderCode size={28} color={colors.primary} />
                    <Text style={styles.iconLabel}>Formulário</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('Lembretes')} style={styles.iconButton}>
                    <NotebookIcon size={28} color={colors.primary} />
                    <Text style={styles.iconLabel}>Lembretes</Text>
                  </TouchableOpacity>
                </MotiView>

                <MotiText
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', duration: 500 }}
                  style={styles.subTitle}
                >
                  Últimos clientes atendidos:
                </MotiText>

                {/* Lista horizontal de clientes */}
                <View style={styles.listWrapper}>
                  <FlatList
                    horizontal
                    data={ultimosClientes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                      <MotiView
                        from={{ opacity: 0, translateX: 200 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        transition={{ type: 'timing', duration: 750 }}
                      >
                        <TouchableOpacity
                          style={styles.cardCliente}
                          onPress={() => navigation.navigate('DetalhesCliente', { cliente: item })}
                        >
                          <Image source={{ uri: item.foto }} style={styles.clientImage} />
                          <Text style={styles.clienteNome}>{item.name.split(' ').slice(0, 2).join(' ')}</Text>
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
                  transition={{ type: 'timing', duration: 1000}}
                  style={styles.addClienteWrapper}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.cardBackground,
                      borderRadius: 20,
                      paddingVertical: 15,
                      alignItems: 'center',
                      marginTop: 50,
                    }}
                    onPress={() => navigation.navigate('AddCliente')}
                  >
                    <Text style={{ color: colors.secondary, fontSize: 18, fontWeight: 'bold' }}>
                      Adicionar Cliente
                    </Text>
                  </TouchableOpacity>
                </MotiView>
              </MotiView>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </MotiView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex1: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    zIndex: 10,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.secondary,
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3A3A3A80',
    paddingHorizontal: 20,
    marginTop: 50,
  },
  iconBar: {
    borderRadius: 24,
    paddingVertical: 12,  
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  iconButton: {
    alignItems: 'center',
    width: 70,
  },
  iconLabel: {
    fontSize: 12,
    color: colors.primaryDark,
    marginTop: 6,
    fontWeight: '600',
  },
  subTitle: {
    fontSize: 18,
    color: '#3A3A3A80',
    marginBottom: 15,
    paddingHorizontal: 20,
    fontWeight: '600',
  },
  listWrapper: {
    paddingBottom: 15,
    marginHorizontal: 0,
  },
  listContainer: {
    paddingHorizontal: 5,
  },
  cardCliente: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 15,
    width: 210,
    height: 260,
    marginRight: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  clientImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  clienteNome: {
    color: colors.secondary,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
    textAlign: 'center',
  },
  clienteProcedimento: {
    color: colors.title,
    fontSize: 14,
    textAlign: 'center',
  },
  clienteData: {
    color: colors.title,
    fontSize: 12,
    marginTop: 8,
  },
  clienteAtendimento: {
    color: colors.success,
    fontSize: 13,
    marginTop: 6,
    fontWeight: '600',
  },
  addClienteWrapper: {
    paddingHorizontal: 35,
    marginTop: 10,
    marginBottom: 40,
  },
});
