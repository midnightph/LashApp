import { auth, database } from '@/src/firebaseConfig';
import FormButton from '@/src/FormButton';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import { collection, doc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function Profile({ route, navigation } : any) {
    const { nome, telefone } = route.params
    const [totalClientes, setTotalClientes] = useState(0);
    const [email, setEmail] = useState('');

    async function getTotalClientes() {
        const clientesCollection = collection(database, 'user', auth.currentUser.uid, 'Clientes');
        const clientesSnapshot = await getDocs(clientesCollection);
        setTotalClientes(clientesSnapshot.size);
        const clienteEmail = auth.currentUser.email;
        setEmail(clienteEmail);
    }

    useEffect(() => {
        getTotalClientes();
    }, []);

    return (
        <ImageBackground source={require('../images/background.png')} style={{flex: 1}}>
        <SafeAreaView style={{ flex: 1, padding: 10 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text>Perfil</Text>
            <Text>Nome: {nome}</Text>
            <Text>Email: {email ? email : <ActivityIndicator />}</Text>
            <Text>Telefone: {telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}</Text>
            <Text>Total de clientes: {totalClientes ? totalClientes : <ActivityIndicator />}</Text>
            <FormButton title="Sair" onPress={async () => {
                await signOut(auth);
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }} />
        </SafeAreaView>
        </ImageBackground>
    )
}