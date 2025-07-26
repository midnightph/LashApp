import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, database } from "../../src/firebaseConfig";
import { useClientes } from "../../src/screens/functions/ClientesContext";
import colors from "@/src/colors";
import {
  BanknoteArrowUp,
  BookOpenCheck,
  Calendar,
  FolderCode,
  NotebookIcon,
  User,
  Users,
} from "lucide-react-native";
import React from "react";

export default function Menus({ navigation }: any) {
  const { clientes } = useClientes();
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [telefone, setTelefone] = useState("");

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) return;

        const docRef = doc(database, "user", user.uid);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const dados = snapshot.data();
          setNome(dados.nome);
          setSobrenome(dados.sobrenome);
          setTelefone(dados.telefone);
        } else {
          console.log("Documento não encontrado");
        }
      } catch (error) {
        console.error("Erro ao buscar cliente do usuário logado:", error);
      }
    };

    fetchClientes();
  }, []);

  return (
    <ImageBackground
      source={require("../images/background.png")}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.header}>Menu Principal</Text>

          <View style={styles.grid}>
            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => navigation.navigate("InfoClientes")}
              accessibilityRole="button"
              accessibilityLabel="Clientes"
            >
              <BanknoteArrowUp size={48} color={colors.primary} />
              <Text style={styles.menuText}>Faturamento</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuCard}
              onPress={() =>
                navigation.navigate("Profile", { nome, telefone, sobrenome })
              }
              accessibilityRole="button"
              accessibilityLabel="Perfil"
            >
              <User size={48} color={colors.primary} />
              <Text style={styles.menuText}>Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => navigation.navigate("Lembretes")}
              accessibilityRole="button"
              accessibilityLabel="Lembretes"
            >
              <NotebookIcon size={48} color={colors.primary} />
              <Text style={styles.menuText}>Lembretes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => navigation.navigate("Agenda")}
              accessibilityRole="button"
              accessibilityLabel="Agenda"
            >
              <Calendar size={48} color={colors.primary} />
              <Text style={styles.menuText}>Agenda</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => navigation.navigate("Formulario")}
              accessibilityRole="button"
              accessibilityLabel="Formulário"
            >
              <FolderCode size={48} color={colors.primary} />
              <Text style={styles.menuText}>Formulário</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => navigation.navigate("Procedimentos")}
              accessibilityRole="button"
              accessibilityLabel="Novo Processo"
            >
              <BookOpenCheck size={48} color={colors.primary} />
              <Text style={styles.menuText}>Procedimentos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => navigation.navigate("Suporte")}
              accessibilityRole="button"
              accessibilityLabel="Suporte"
            >
              <Users size={48} color={colors.primary} />
              <Text style={styles.menuText}>Suporte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: "flex-start",
  },
  header: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.secondary,
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: 1.2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    width: "48%",
    height: 160,
    marginBottom: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    gap: 14,
  },
  menuText: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
  },
});
