import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
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

export default function App({navigation}: any) {
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
        setNome(dados.nome); // agora é o nome do usuário logado
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
    const carregar = async () => {
      await carregarClientes();
      setIsLoading(true);
      const atualizados = atualizarUltimosClientes(); // <- espera os dados carregarem
      setUltimosClientes(atualizados);
      setIsLoading(false);
    };
    carregar();
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
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={[styles.container, { paddingTop: insets.top }]}>
                        <View style={styles.header}>
                            <Text style={styles.welcomeText}>👋 Bem-vindo(a) ao Studio Lash{nome ? ' ' + nome : ''}!</Text>
                            <Text style={styles.subtitle}>Últimos clientes atendidos:</Text>
                        </View>

                        {ultimosClientes.length > 0 ?<View style={{ paddingBottom: 20 }}>
                            {isLoading ? <Text style={styles.loadingText}>Carregando clientes...</Text> : <FlatList
                                horizontal
                                data={ultimosClientes}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={styles.clienteCard} onPress={() => {
                                        navigation.navigate('DetalhesCliente', { cliente: item });
                                     }}>        
                                        <Image
                                            source={{ uri: item.foto }}
                                            style={styles.clientImage}
                                        />
                                        <Text style={styles.clienteNome}>{item.name}</Text>
                                        <Text style={styles.clienteProcedimento}>{item.proc}</Text>
                                        <Text style={styles.clienteData}>{item.dataNasc.toDate().toLocaleDateString() || 'Data não disponível'}</Text>
                                        {item.statusProc ? (
                                            <Text style={styles.clienteAtendimento}>Em atendimento</Text>
                                        ) : (
                                            <Text style={styles.clienteAtendimento}></Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                                contentContainerStyle={styles.listContainer}
                                showsHorizontalScrollIndicator={false}
                            />}
                        </View>: <Text style={styles.nCliente}>Nenhum cliente atendido ainda.</Text>}

                        <AddCliente />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}