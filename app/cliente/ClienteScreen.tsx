import { useEffect, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../home/styles';
import { useClientes } from '../../src/screens/functions/ClientesContext';

export default function ClienteScreen({navigation} : any) {

    const [termoBusca, setTermoBusca] = useState('');
    const [nome, setNome] = useState('');

    const { clientes, carregarClientes } = useClientes();
    
        useEffect(() => {
            carregarClientes();
        }, []);

    const filterClientes = () => {
        return clientes.filter(cliente => {
            return cliente.nome.toLowerCase().includes(termoBusca.toLowerCase())
        })
    }
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF2F5' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF2F5" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >

                    <View style={styles.header}>
                        <Text style={styles.welcomeText}>Clientes</Text>
                        <Text style={styles.subtitle}>Pesquise por nome:</Text>
                        <TextInput
                            style={styles.input}
                            value={termoBusca}
                            onChangeText={setTermoBusca}
                            placeholder='Digite o nome do cliente'
                        />

                        <FlatList 
                            data={filterClientes()}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.clienteContainer} onPress={() => {
                                        navigation.navigate('DetalhesCliente', { cliente: item });
                                    }}>
                                    <Image source={{ uri: item.foto }} style={styles.clienteImage} />
                                    <View style={styles.clienteInfo}>
                                        <Text style={styles.clienteNome}>{item.nome}</Text>
                                        <Text style={styles.clienteProcedimento}>{item.procedimento}</Text>
                                        <Text style={styles.clienteData}>{item.dataNasc || item.dataNascimento || 'Data não disponível'}</Text>
                                    </View>
                                    <View>
                                        {item.atendimento ? <Text style={styles.clienteAtendimento}>Em atendimento</Text> : <Text style={styles.clienteAtendimento}></Text>}
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
            </KeyboardAvoidingView>
        </SafeAreaView> 
    );
}