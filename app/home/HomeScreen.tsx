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
import { getDocs, collection } from 'firebase/firestore';

export default function App({navigation}: any) {
    const { clientes, carregarClientes, atualizarUltimosClientes } = useClientes();
    const insets = useSafeAreaInsets();
    const [ultimosClientes, setUltimosClientes] = useState([]);

    const [nome, setNome] = useState('');

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const querySnapshot = await getDocs(collection(database, 'user'));
                const clientesArray: any[] = [];

                querySnapshot.forEach((doc) => {
                    clientesArray.push({ id: doc.id, ...doc.data() });
                });

                setNome(clientesArray[0].nome);
            } catch (error) {
                console.error('Erro ao buscar clientes:', error);
            }
        };

        fetchClientes();
    }, []);

    useFocusEffect(
    useCallback(() => {
      carregarClientes();
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

                        <View style={{ paddingBottom: 20 }}>
                            <FlatList
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
                                        <Text style={styles.clienteNome}>{item.nome}</Text>
                                        <Text style={styles.clienteProcedimento}>{item.procedimento}</Text>
                                        <Text style={styles.clienteData}>{item.dataNasc || 'Data não disponível'}</Text>
                                        {item.atendimento ? (
                                            <Text style={styles.clienteAtendimento}>Em atendimento</Text>
                                        ) : (
                                            <Text style={styles.clienteAtendimento}></Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                                contentContainerStyle={styles.listContainer}
                                showsHorizontalScrollIndicator={false}
                            />
                        </View>

                        <AddCliente />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}