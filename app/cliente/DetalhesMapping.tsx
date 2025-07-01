import colors from "@/src/colors";
import { database } from "@/src/firebaseConfig";
import { getAuth } from "firebase/auth";
import { arrayRemove, doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { MotiView } from "moti";
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";

export default function DetalhesMapping({ navigation, route }: any) {
  const { item, clienteId } = route.params;
  const data = item.data.toDate().toLocaleDateString();
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [clienteNome, setClienteNome] = useState("");

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
    try {
      const ref = doc(database, "user", user.uid, "Clientes", clienteId);
      await updateDoc(ref, {
        historico: arrayRemove(item),
      });
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

  const enviarTextoWhatsApp = async () => {
    await fetchTelefone();
    const telefoneFormatado = telefoneCliente; // Altere conforme necessário
    const dataFormatada = item.data.toDate().toLocaleDateString();
    const texto = `Olá ${clienteNome}! Aqui está seu mapping:\n${item.mapping}\nData: ${dataFormatada}\nImagem: ${item.foto || "Imagem não disponível"}`;
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

  return (
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

        <TouchableOpacity onPress={confirmarExclusao} style={styles.button}>
          <Text style={styles.buttonText}>Excluir atendimento</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={enviarTextoWhatsApp} style={styles.button}>
          <Text style={styles.buttonText}>Enviar para a cliente?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={baixarECompartilharImagem}
          style={[styles.button, { backgroundColor: colors.primaryDark }]}
        >
          <Text style={styles.buttonText}>Compartilhar imagem com a cliente</Text>
        </TouchableOpacity>
      </MotiView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF2F5",
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
    width: 150,
    height: 150,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: colors.secondary,
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
