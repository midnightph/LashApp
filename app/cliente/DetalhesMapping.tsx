import { database } from "@/src/firebaseConfig";
import { getAuth } from "firebase/auth";
import { arrayRemove, doc, Timestamp, updateDoc } from "firebase/firestore";
import { Text, View, Image, TouchableOpacity, Alert } from "react-native";
import { StyleSheet } from "react-native";
import Toast from "react-native-toast-message";

export default function DetalhesMapping({ navigation, route }: any) {

    const { item, clienteId } = route.params;  

    const excluir = async () => {
  const user = getAuth().currentUser;

  try {
    const ref = doc(database, 'user', user.uid, 'Clientes', clienteId);

    await updateDoc(ref, {
      historico: arrayRemove(item)
    });

    Toast.show({
      type: 'info',
      text1: 'Atendimento excluído com sucesso!',
      position: 'bottom'
    });

    navigation.reset({
      index: 0,
      routes: [{ name: 'Tabs' }]
    });

  } catch (error) {
    console.error('Erro ao excluir atendimento:', error);
  }
};

    const confirmarExclusao = () => {
        Alert.alert(
            'Confirmar exclusão',
            'Você deseja realmente excluir esse atendimento?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    onPress: () => {
                        excluir()
                    },
                    style: 'destructive'
                },
            ],
            { cancelable: true }
        )
    }

    const data = item.data.toDate().toLocaleDateString();

    return(
        <View>
            <Image source={{ uri: item.foto }} style={style.clientImage} />
            <Text>{item.mapping}</Text>
            <Text>{item.valor}</Text>
            <Text>{data}</Text>
            <Text>{item.observacoes}</Text>
            <TouchableOpacity onPress={() => {
                confirmarExclusao()
            }}><Text>Excluir</Text></TouchableOpacity>
        </View>
    )
}

const style = StyleSheet.create({
    clientImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 12,
    }
});