import colors from "@/src/colors";
import { database } from "@/src/firebaseConfig";
import FormButton from "@/src/FormButton";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { Button, TextInput, TouchableOpacity } from "react-native";
import { View, Text } from "react-native";
import MaskInput, { Masks } from "react-native-mask-input";
import Toast from "react-native-toast-message";

export default function EditarCliente({ navigation, route }: any) {
    const { cliente } = route.params;

    const [nome, setNome] = useState(cliente.name);
    const [telefone, setTelefone] = useState(cliente.telefone);

    const updateCliente = async (id: string, data: any) => {
        const user = getAuth().currentUser;
        if (!user) return;

        if(nome === '' || telefone === '' || nome=== cliente.name || telefone === cliente.telefone) {
            return Toast.show({
                type: 'error',
                text1: 'Preencha todos os campos corretamente!',
                position: 'bottom',
            });
        }

        const userRef = doc(database, 'user', user.uid, 'Clientes', id);
        await updateDoc(userRef, data);
        navigation.navigate('DetalhesCliente', { cliente: { ...cliente, name: nome, telefone: telefone } })
    }

    return (
        <View style={{ flex: 1, paddingHorizontal: 20, backgroundColor: colors.background }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 }}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={35} color={colors.primary} />
                </TouchableOpacity>
                <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.primary }}>Editar Cliente</Text>
            </View>

            <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center'}}>
                <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center', marginVertical: 20 }}>
                    <Text style={{ fontSize: 18, color: colors.textDark }}>Nome: </Text>
                    <TextInput
                        placeholder="Digite o nome do cliente"
                        placeholderTextColor={colors.textDark}
                        value={nome}
                        onChangeText={(text) => setNome(text)}
                        style={{ fontSize: 18, color: colors.textDark, backgroundColor: colors.cardBackground, padding: 10, borderRadius: 10, flex: 1 }}
                    />
                </View>
                <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center'}}>
                    <Text style={{ fontSize: 18, color: colors.textDark }}>Telefone: </Text>
                    <MaskInput
                        placeholder="Digite o telefone do cliente"
                        placeholderTextColor={colors.textDark}
                        value={telefone}
                        style={{ fontSize: 18, color: colors.textDark, backgroundColor: colors.cardBackground, padding: 10, borderRadius: 10, flex: 1 }}
                        onChangeText={(masked, unmasked) => {
                            setTelefone(unmasked);
                        }}
                        mask={Masks.BRL_PHONE}
                        keyboardType="phone-pad"
                    />
                </View>
                <FormButton title="Salvar" onPress={() => {
                    updateCliente(cliente.id, { name: nome, telefone: telefone });
                    }} maxWidth={200} />
            </View>
        </View>
    );
}