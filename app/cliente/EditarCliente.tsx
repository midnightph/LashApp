import colors from '@/src/colors';
import { database } from '@/src/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useState } from 'react';
import {
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    TextInput,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateDoc, doc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Toast from 'react-native-toast-message';
import FormButton from '@/src/FormButton';
import MaskInput, { Masks } from 'react-native-mask-input';

export default function EditarCliente({ route, navigation }: any) {
    const { cliente } = route.params;
    const [clienteName, setClienteName] = useState(cliente.name);
    const converteDataNasc = new Date(cliente.dataNasc.toDate()).toLocaleDateString('pt-BR');
    const [dataNasc, setDataNasc] = useState(converteDataNasc);
    const [telefone, setTelefone] = useState(cliente.telefone);

    const salvarAlteracoes = async () => {
        const user = getAuth().currentUser;
        try {
            const [dia, mes, ano] = dataNasc.split('/');
            const dataFormatada = new Date(`${ano}-${mes}-${dia}`); // formato aceito por Date()
            const timestampData = Timestamp.fromDate(dataFormatada);
            const ref = doc(database, 'user', user.uid, 'Clientes', cliente.id);
            await updateDoc(ref, {
                name: clienteName,
                dataNasc: timestampData,
                telefone,
            });
            Toast.show({
                type: 'success',
                text1: 'Cliente atualizado com sucesso!',
                position: 'bottom',
            });
            navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            Toast.show({
                type: 'error',
                text1: 'Erro ao atualizar cliente',
                position: 'bottom',
            });
        }
    };

    return (
        <ImageBackground source={require('../images/background.png')} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, padding: 20 }}>
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'timing', duration: 800 }}
                    style={styles.header}
                >
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={35} color={colors.secondary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Editar Cliente</Text>
                </MotiView>

                <MotiView style={styles.inputGroup}>
                    <Text style={styles.label}>Nome:</Text>
                    <TextInput
                        style={styles.input}
                        value={clienteName}
                        onChangeText={setClienteName}
                    />
                </MotiView>

                <MotiView style={styles.inputGroup}>
                    <Text style={styles.label}>Telefone:</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="phone-pad"
                        value={telefone}
                        onChangeText={setTelefone}
                    />
                </MotiView>

                <MotiView style={styles.inputGroup}>
                    <Text style={styles.label}>Data de nascimento:</Text>
                    <MaskInput
                        mask={Masks.DATE_DDMMYYYY}
                        style={styles.input}
                        value={dataNasc}
                        onChangeText={setDataNasc}
                        placeholder="dd/mm/aaaa"
                        keyboardType='numeric'
                    />
                </MotiView>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <FormButton title="Salvar" onPress={salvarAlteracoes} maxWidth={300} secondary />
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        color: colors.secondary,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        color: colors.primary,
        marginBottom: 5,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: colors.background,
        borderRadius: 20,
        paddingHorizontal: 16,
        color: colors.textDark,
        borderWidth: 2,
        borderColor: colors.secondary,
    },
});
