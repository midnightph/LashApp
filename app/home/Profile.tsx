import colors from '@/src/colors';
import { auth, database } from '@/src/firebaseConfig';
import FormButton from '@/src/FormButton';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function Profile({ route, navigation }: any) {
    const { nome, telefone, sobrenome } = route.params;
    const [totalClientes, setTotalClientes] = useState(0);
    const [email, setEmail] = useState('');
    const [procedimento, setProcedimento] = useState('');
    const [cuidados, setCuidados] = useState('');
    const [procedimentos, setProcedimentos] = useState([]);

    useEffect(() => {
        getTotalClientes();
        fetchProcedimentos();
    }, []);

    async function getTotalClientes() {
        const clientesCollection = collection(database, 'user', auth.currentUser.uid, 'Clientes');
        const clientesSnapshot = await getDocs(clientesCollection);
        setTotalClientes(clientesSnapshot.size);
        setEmail(auth.currentUser.email);
    }

    const adicionarProcedimento = async (auth: any) => {
        if (!auth) {
            return Toast.show({ type: 'error', text1: 'Você precisa estar logado para adicionar um procedimento!', position: 'bottom' });
        }

        const novoProcedimento = {
            procedimento: procedimento,
            cuidados: cuidados
        };

        try {
            const docRef = await addDoc(collection(database, 'user', auth.currentUser.uid, 'Cuidados'), novoProcedimento);
            setProcedimentos(prev => [...prev, { id: docRef.id, ...novoProcedimento }]);
            setProcedimento('');
            setCuidados('');
            Toast.show({ type: 'success', text1: 'Procedimento adicionado com sucesso!', position: 'bottom' });
        } catch (error) {
            console.log(error);
            Toast.show({ type: 'error', text1: 'Erro ao adicionar procedimento', position: 'bottom' });
        }
    };

    const fetchProcedimentos = async () => {
        try {
            const procedimentosCollection = collection(database, 'user', auth.currentUser.uid, 'Cuidados');
            const procedimentosSnapshot = await getDocs(procedimentosCollection);
            const lista = procedimentosSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setProcedimentos(lista);
        } catch (error) {
            console.log('Erro ao buscar procedimentos:', error);
        }
    };

    const excluirProcedimento = async (id: any) => {
        try {
            await deleteDoc(doc(database, 'user', auth.currentUser.uid, 'Cuidados', id));
            setProcedimentos((prev) => prev.filter((item) => item.id !== id));
            Toast.show({ type: 'success', text1: 'Procedimento excluído com sucesso!', position: 'bottom' });
        } catch (error) {
            console.log(error);
            Toast.show({ type: 'error', text1: 'Erro ao excluir procedimento', position: 'bottom' });
        }
    };

    const deleteAccount = async (auth: any) => {
        try {
            await deleteDoc(doc(database, 'user', auth.currentUser.uid));
            await auth.currentUser.delete();
            Toast.show({ type: 'success', text1: 'Conta excluída com sucesso!', position: 'bottom' });
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } catch (error) {
            console.log(error);
            Toast.show({ type: 'error', text1: 'Erro ao excluir conta', position: 'bottom' });
        }
    };

    return (
        <ImageBackground source={require('../images/background.png')} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, padding: 15 }}>
                <MotiView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 }} from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 1000 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={35} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.primary }}>Perfil</Text>
                </MotiView>

                <MotiView style={{ flexDirection: 'column', marginBottom: 10, gap: 10 }} from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 1000 }}>
                    <Text style={styles.text}>Nome: {nome} {sobrenome}</Text>
                    <Text style={styles.text}>Email: {email ? email : <ActivityIndicator />}</Text>
                    <Text style={styles.text}>Telefone: {telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}</Text>
                    <Text style={styles.text}>Total de clientes: {totalClientes ? totalClientes : '0'}</Text>

                    <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.primary }}>Adicionar procedimento: </Text>
                    <TextInput
                        style={{ backgroundColor: colors.textLight, padding: 10, borderRadius: 5 }}
                        placeholder="Procedimento"
                        value={procedimento}
                        onChangeText={(text) => setProcedimento(text)}
                    />
                    <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.primary }}>Cuidados: </Text>
                    <TextInput
                        style={{
                            backgroundColor: colors.textLight,
                            padding: 10,
                            borderRadius: 8,
                            width: '100%',
                            textAlignVertical: 'top',
                            fontSize: 16,
                            minHeight: 120,
                        }}
                        placeholder="Cuidados"
                        multiline
                        value={cuidados}
                        onChangeText={(text) => setCuidados(text)}
                    />
                    <FormButton title="Salvar" onPress={() => adicionarProcedimento(auth)} />

                    <FlatList
                        data={procedimentos}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={{ backgroundColor: colors.textLight, padding: 10, borderRadius: 8, marginBottom: 10 }} onPress={() => {
                                Alert.alert(
                                    'Confirmar exclusão',
                                    'Tem certeza que deseja excluir o procedimento?',
                                    [
                                        {
                                            text: 'Sim',
                                            onPress: () => excluirProcedimento(item.id),
                                        },
                                        {
                                            text: 'Não',
                                            style: 'cancel',
                                        },
                                    ],
                                    { cancelable: false }
                                );
                            }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary }}>{item.procedimento}</Text>
                                <Text style={{ fontSize: 16, color: colors.primary }}>{item.cuidados}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.id}
                    />

                    <FormButton title="Sair" onPress={async () => {
                        await signOut(auth);
                        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                    }} />

                    <TouchableOpacity style={{ backgroundColor: colors.danger, padding: 10, borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => deleteAccount(auth)}
                    >
                        <Text style={{ color: colors.textLight }}>Deletar Conta</Text>
                    </TouchableOpacity>
                </MotiView>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    text: { fontSize: 20, fontWeight: 'bold', color: colors.textDark }
});
