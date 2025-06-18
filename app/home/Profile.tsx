import { Button, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AccordionField from '../../src/screens/functions/accordionField';
import { StyleSheet } from "react-native";
import { enviarLembretesEmLote } from '../../src/screens/functions/whatsappService';
import { useState } from "react";
import { useClientes } from '../../src/screens/functions/ClientesContext';
import { router } from "expo-router";
import sair from '../index';

export default function Profile({navigation}: any) {
    const [whatsapp, setWhatsapp] = useState('');
    const { clientes } = useClientes();
    const handleEnviarLembretes = () => {
        enviarLembretesEmLote(clientes, whatsapp);
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF2F5' }}>
        <View style={styles.container}>
            <Text style={styles.title}>Perfil</Text>
            
            <AccordionField title={'👤 Dados pessoais'}>
                <Text style={styles.insideContainer}>Nome: João da Silva</Text>
            </AccordionField>

            <AccordionField title='📞 Melhore seu atendimento'>
                <View style={{ flexDirection: 'column' }}>
                    <Text style={styles.insideContainer}>Seu número de Whatsapp:</Text>
                    <TextInput placeholder='(11) 99999-9999' style={styles.insideContainer} value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad"/>
                    <Button title='Enviar lembretes' onPress={handleEnviarLembretes} />
                </View>
            </AccordionField>

            <AccordionField title='📱 Suporte'>
                <Text style={styles.insideContainer}>Whatsapp: (11) 99999-9999</Text>
                <Text style={styles.insideContainer}>Email: WlB0j@example.com</Text>
            </AccordionField>
            <Button title='Sair' onPress={() => {sair()}} />
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