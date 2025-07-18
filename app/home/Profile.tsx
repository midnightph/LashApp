import colors from '@/src/colors';
import { auth, database } from '@/src/firebaseConfig';
import FormButton from '@/src/FormButton';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

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

    const deleteAccount = async (auth: any) => {
        await deleteDoc(doc(database, 'user', auth.currentUser.uid));
        await auth.currentUser.delete().then(() => {
            Toast.show({ type: 'success', text1: 'Conta excluida com sucesso!', position: 'bottom' });
        }).catch((error) => {
            console.log(error);
        });
        Toast.show({ type: 'success', text1: 'Conta excluida com sucesso!', position: 'bottom' });
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    return (
        <ImageBackground source={require('../images/background.png')} style={{flex: 1}}>
        <SafeAreaView style={{ flex: 1, padding: 15}}>
        <MotiView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 }} from={{opacity: 0}} animate={{opacity: 1}} transition={{type: 'timing', duration: 1000}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={35} color={colors.primary} />
            </TouchableOpacity>
            <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.primary }}>Perfil</Text>
        </MotiView>
        <MotiView style={{ flexDirection: 'column', marginBottom: 10, gap: 10 }} from={{opacity: 0}} animate={{opacity: 1}} transition={{type: 'timing', duration: 1000}}>
            <Text style={styles.text}>Nome: {nome}</Text>
            <Text style={styles.text}>Email: {email ? email : <ActivityIndicator />}</Text>
            <Text style={styles.text}>Telefone: {telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}</Text>
            <Text style={styles.text}>Total de clientes: {totalClientes ? totalClientes : <ActivityIndicator />}</Text>
            <FormButton title="Sair" onPress={async () => {
                await signOut(auth);
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }} />
            <TouchableOpacity style={{backgroundColor: colors.danger, padding: 10, borderRadius: 5, alignItems: 'center', justifyContent: 'center'}}
            onPress={() => {
            deleteAccount(auth)
            }}
            ><Text style={{color: colors.textLight}}>Deletar Conta</Text></TouchableOpacity>
        </MotiView>
        </SafeAreaView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    text:{ fontSize: 20, fontWeight: 'bold', color: colors.textDark }
});