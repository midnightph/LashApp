import { Button, Linking, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AccordionField from '../../src/screens/functions/accordionField';
import { StyleSheet } from "react-native";
import { enviarLembretesEmLote } from '../../src/screens/functions/whatsappService';
import { useEffect, useState } from "react";
import { useClientes } from '../../src/screens/functions/ClientesContext';
import { Link, router } from "expo-router";
import sair from '../index';
import { getAuth, signOut } from "firebase/auth";
import { auth, database } from "../../src/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function Profile({navigation}: any) {
    const [whatsapp, setWhatsapp] = useState('');
    const { clientes } = useClientes();
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const handleEnviarLembretes = () => {
        enviarLembretesEmLote(clientes, telefone);
    }

    const signOutApp = async () => {
        await signOut(auth);
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }]
        })
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
        setTelefone(dados.telefone);
        } else {
        console.log('Documento não encontrado');
        }
        } catch (error) {
        console.error('Erro ao buscar cliente do usuário logado:', error);
        }
        };

        fetchClientes();
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF2F5' }}>
        <View style={styles.container}>
            <Text style={styles.title}>Perfil</Text>
            
            <AccordionField title={'👤 Dados pessoais'}>
                <Text style={styles.insideContainer}>Nome: {nome}</Text>
            </AccordionField>

            <AccordionField title='📞 Melhore seu atendimento'>
                <View style={{ flexDirection: 'column' }}>
                    <Button title='Enviar lembretes' onPress={handleEnviarLembretes} />
                </View>
            </AccordionField>

            <AccordionField title='📱 Suporte'>
                <TouchableOpacity onPress={() => {Linking.openURL('https://wa.me/41998780288?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20um%20atendimento')}}>
                <Text style={[styles.insideContainer, { color: '#000', textDecorationLine: 'underline' }]}>Whatsapp: (41) 99878-0288</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {Linking.openURL('mailto:pedrorodacinski26@gmail.com')}}>
                <Text style={[styles.insideContainer, { color: '#000', textDecorationLine: 'underline' }]}>Email: pedrorodacinski26@gmail.com</Text>
                </TouchableOpacity>
            </AccordionField>
            <Button title='Sair' onPress={() => {signOutApp()}} />
        </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF2F5',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#E8B4B4',  // Rosa poá
        marginBottom: 8,
    },
    insideContainer: {
        color: '#000',
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 5,
    },
});