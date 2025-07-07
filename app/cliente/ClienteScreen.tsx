import { useEffect, useState } from 'react';
import { FlatList, Image, ImageBackground, KeyboardAvoidingView, Platform, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../cliente/clientStyles';
import { useClientes } from '../../src/screens/functions/ClientesContext';
import colors from '@/src/colors';
import { MotiView } from 'moti';

export default function ClienteScreen({navigation} : any) {

    const [termoBusca, setTermoBusca] = useState('');
    const [nome, setNome] = useState('');
    let dataNasc: any;

    const { clientes, carregarClientes } = useClientes();
    
        useEffect(() => {
            carregarClientes();
        }, []);

    const filterClientes = () => {
        return clientes.filter(cliente => {
            return cliente.name.toLowerCase().includes(termoBusca.toLowerCase())
            
        })
    }

    return (
        <ImageBackground source={require('../images/background.png')} style={{flex: 1}}>
        <SafeAreaView style={{ flex: 1}}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF2F5" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >

                    <MotiView from={{ opacity: 0}} animate={{ opacity: 1}} transition={{ type: 'timing', duration: 1000 }} style={styles.header}>
                        <Text style={styles.welcomeText}>Clientes</Text>
                        <Text style={styles.subtitle}>Pesquise por nome:</Text>
                        <TextInput
                            style={styles.input}
                            value={termoBusca}
                            onChangeText={setTermoBusca}
                            placeholder='Digite o nome do cliente'
                            placeholderTextColor={colors.title}
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
                                        <Text style={[styles.clienteNome, { maxWidth: 100}]}>{item.name.split(' ').slice(0, 2).join(' ')}</Text>
                                        <Text style={styles.clienteProcedimento}>{item.proc}</Text>
                                        <Text style={styles.clienteData}>{item.dataNasc.toDate().toLocaleDateString('pt-BR')}</Text>
                                    </View>
                                    <View>
                                        {item.statusProc ? <Text style={styles.clienteAtendimento}>Em atendimento</Text> : <Text style={styles.clienteAtendimento}></Text>}
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </MotiView>
            </KeyboardAvoidingView>
        </SafeAreaView> 
        </ImageBackground>
    );
}