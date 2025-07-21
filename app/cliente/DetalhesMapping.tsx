import colors from "@/src/colors";
import { database, uploadImagem } from "@/src/firebaseConfig";
import FormButton from "@/src/FormButton";
import { useClientes } from "@/src/screens/functions/ClientesContext";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from "expo-sharing";
import { getAuth } from "firebase/auth";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { deleteObject, getStorage, ref } from "firebase/storage";
import { get } from "lodash";
import { MotiView } from "moti";
import { useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function DetalhesMapping({ navigation, route }: any) {
  const { item, clienteId, id } = route.params;
  const data = item.data.toDate().toLocaleDateString();
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const { carregarClientes } = useClientes();
  const [imagem, setImagem] = useState(item.foto);

  const fetchTelefone = async () => {
      const user = getAuth().currentUser;
      const ref = doc(database, "user", user.uid, "Clientes", clienteId);
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        setTelefoneCliente(docSnap.data().telefone);
        setClienteNome(docSnap.data().name);
      }
    }

  const excluir = async () => {
    const user = getAuth().currentUser;
    const storage = getStorage()
    try {
      const ref1 = doc(database, "user", user.uid, "Clientes", clienteId, "Historico", id);
      const storagePath = item.foto;
      if(storagePath !== "https://www.rastelliparis.com.br/cdn/shop/files/259F7269-2915-4F81-B903-B4C3AB1C2E51.jpg?v=1721635769&width=1445"){
        const decodePath = decodeURIComponent(storagePath);
      const storageRef = ref(storage, decodePath);
      await deleteObject(storageRef);
      }
      
      
      await deleteDoc(ref1);
      await carregarClientes();
      Toast.show({
        type: "info",
        text1: "Atendimento excluído com sucesso!",
        position: "bottom",
      });
      navigation.reset({
        index: 0,
        routes: [{ name: "Tabs" }],
      });
    } catch (error) {
      console.error("Erro ao excluir atendimento:", error);
    }
  };

  const confirmarExclusao = () => {
    Alert.alert(
      "Confirmar exclusão",
      "Você deseja realmente excluir esse atendimento?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", onPress: excluir, style: "destructive" },
      ],
      { cancelable: true }
    );
  };

  const encurtarUrl = async (urlOriginal: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(urlOriginal)}`);
    const shortUrl = await response.text();
    return shortUrl;
  } catch (error) {
    console.error('Erro ao encurtar URL:', error);
    return null;
  }
};

  const enviarTextoWhatsApp = async () => {
    await fetchTelefone();
    const urlEncurtada = await encurtarUrl(item.foto);
    const telefoneFormatado = telefoneCliente; // Altere conforme necessário
    const dataFormatada = item.data.toDate().toLocaleDateString();
    const texto = `Olá ${clienteNome}! Aqui está seu mapping:\n${item.mapping}\nData: ${dataFormatada}\nImagem: ${urlEncurtada || "Imagem não disponível"}`;
    const url = `https://wa.me/${telefoneFormatado}?text=${encodeURIComponent(
      texto
    )}`;
    Linking.openURL(url).catch(() =>
      alert("Não foi possível abrir o WhatsApp")
    );
  };

  const baixarECompartilharImagem = async () => {
    if (!item.foto) {
      alert("Imagem não disponível");
      return;
    }

    try {
      const fileUri = FileSystem.documentDirectory + "mapping.jpg";
      await FileSystem.downloadAsync(item.foto, fileUri);
      await Sharing.shareAsync(fileUri, {
        mimeType: "image/jpeg",
        dialogTitle: "Compartilhar imagem com a cliente",
        UTI: "image/jpeg",
      });
    } catch (error) {
      console.error("Erro ao compartilhar imagem:", error);
      alert("Erro ao baixar ou compartilhar a imagem");
    }
  };

  const tirarFoto = async () => {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão negada', ' Vocé precisa permitir acesso à câmera.');
      return;

    }
    const resultado = await ImagePicker.launchCameraAsync({ quality: 0.4, base64: false });

    if (!resultado.canceled) {
      const user = getAuth().currentUser;
      const uri = resultado.assets[0].uri;
      const urlFirebase = await uploadImagem(uri, clienteId, user.uid, id);
      try{
        await updateDoc(doc(database, 'user', user.uid, 'Clientes', clienteId, 'Historico', id), { foto: urlFirebase });
        await updateDoc(doc(database, 'user', user.uid, 'Clientes', clienteId), { foto: urlFirebase });
      } catch (error) {
        console.error('Erro ao atualizar foto:', error);
      } finally {
        setImagem(urlFirebase);
        navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
      }
    }
  }

  return (
    <>
    <ImageBackground source={require('../images/background.png')} style={{ flex: 1 }}>
    <MotiView style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, gap: 10, marginTop: 10 }} from={{opacity: 0}} animate={{opacity: 1}} transition={{type: 'timing', duration: 1000}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={35} color={colors.primary} />
            </TouchableOpacity>
            <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.primary }}>Perfil</Text>
        </MotiView>
    <SafeAreaView style={styles.container}>
      <MotiView
        style={styles.card}
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400 }}
      >
        <Image source={{ uri: item.foto }} style={styles.clientImage} />
        <Text style={styles.title}>{item.mapping}</Text>
        <Text style={styles.text}>Valor: {item.valor}</Text>
        <Text style={styles.text}>Data: {data}</Text>
        {item.observacoes && (
          <Text style={styles.text}>Obs: {item.observacoes}</Text>
        )}

        <FormButton title="Excluir atendimento" onPress={confirmarExclusao} maxWidth={250} danger/>

        <FormButton title="Enviar para WhatsApp" onPress={enviarTextoWhatsApp} maxWidth={250} secondary/>

        <FormButton title="Compartilhar imagem" onPress={baixarECompartilharImagem} maxWidth={250} secondary/>

        <FormButton title="Tirar foto" onPress={tirarFoto} maxWidth={250} />
      </MotiView>
    </SafeAreaView>
    </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderColor: colors.secondary,
    borderWidth: 1,
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    width: "100%",
  },
  clientImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
  },
  text: {
    fontSize: 16,
    color: colors.title,
  },
  button: {
    marginTop: 20,
    backgroundColor: colors.danger,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
