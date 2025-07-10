import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, database } from "../../src/firebaseConfig";
import { useClientes } from '../../src/screens/functions/ClientesContext';
import { enviarLembretesEmLote } from '../../src/screens/functions/whatsappService';
import colors from "@/src/colors";
import { Calendar, NotebookIcon, User, Users } from "lucide-react-native";

export default function Menus({ navigation }: any) {
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
        <ImageBackground source={require('../images/background.png')} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1}}>
                <View style={styles.container}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <TouchableOpacity style={styles.menus} onPress={() => navigation.navigate('DetalhesCliente')}>
                            <Users size={40} color='#E8B4B4' />
                            <Text style={styles.title}>Clientes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menus} onPress={() => navigation.navigate('Profile', { nome, telefone })}>
                            <User size={40} color='#E8B4B4' />
                            <Text style={styles.title}>Perfil</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menus} onPress={() => navigation.navigate('Lembretes')}>
                            <NotebookIcon size={40} color='#E8B4B4' />
                            <Text style={styles.title}>Lembretes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menus} onPress={() => navigation.navigate('Agenda')}>
                            <Calendar size={40} color='#E8B4B4' />
                            <Text style={styles.title}>Agenda</Text>
                        </TouchableOpacity>
                    </View>
                    <Button title='Sair' onPress={() => { signOutApp() }} />
                </View>
            </SafeAreaView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 20,
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
    menus: {
        maxWidth: '49%',
        maxHeight: 150,
        backgroundColor: colors.cardBackground,  // Rosa poá
        minWidth: '49%',
        minHeight: 150,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: colors.secondary,
        gap: 10
    }
});