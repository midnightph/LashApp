import colors from "@/src/colors";
import { database } from "@/src/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth/react-native";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Linking,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Lembretes({ navigation }: any) {
  const [lembretes, setLembretes] = useState([]);
  const [aniversariantes, setAniversariantes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const user = getAuth().currentUser;

    const fetchDados = async () => {
      if (!user) return;

      setIsLoading(true);
      const uid = user.uid;

      const hoje = new Date();
      const amanha = new Date();
      amanha.setDate(hoje.getDate() + 1);

      // 🔔 Agendamentos
      const lembretesAmanha: any[] = [];
      const agendamentoRef = collection(database, "user", uid, "Agendamentos");
      const agendamentoSnapshot = await getDocs(agendamentoRef);

      agendamentoSnapshot.forEach((doc) => {
        const data = doc.data();
        const dataAgendamento = data.data?.toDate?.();
        if (
          dataAgendamento &&
          dataAgendamento.getDate() === amanha.getDate() &&
          dataAgendamento.getMonth() === amanha.getMonth() &&
          dataAgendamento.getFullYear() === amanha.getFullYear()
        ) {
          lembretesAmanha.push({ id: doc.id, ...data });
        }
      });

      // 🎉 Aniversariantes
      const aniversariantesHoje: any[] = [];
      const clienteRef = collection(database, "user", uid, "Clientes");
      const clienteSnapshot = await getDocs(clienteRef);

      clienteSnapshot.forEach((doc) => {
        const data = doc.data();
        const nascimento = data.dataNasc?.toDate?.();

        if (
          nascimento &&
          nascimento.getDate() === hoje.getDate() &&
          nascimento.getMonth() === hoje.getMonth()
        ) {
          aniversariantesHoje.push({ id: doc.id, ...data });
        }
      });

      setLembretes(lembretesAmanha);
      setAniversariantes(aniversariantesHoje);
      setIsLoading(false);
    };

    fetchDados();
  }, []);

  return (
    <ImageBackground
      source={require("../images/background.png")}
      resizeMode="cover"
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Lembretes</Text>
        </View>

        {isLoading ? (
          <Text>Carregando...</Text>
        ) : (
          <>
            {lembretes.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>📅 Agendamentos para amanhã:</Text>
                <FlatList
                  data={lembretes}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.card}
                      onPress={() =>
                        Linking.openURL(
                          `https://wa.me/55${item.telefone.replace(/\D/g, "")}?text=Ol%C3%A1%20${item.nomeCliente}%2C%20poder%C3%A1%20confirmar%20o%20seu%20hor%C3%A1rio%20no%20dia%20${item.data
                            .toDate()
                            .toLocaleDateString()}%20%C3%A0s%20${item.data
                            .toDate()
                            .toLocaleTimeString()
                            .slice(0, 5)}?%20😊`
                        )
                      }
                    >
                      <Text>Nome: {item.nomeCliente}</Text>
                      <Text>Data: {item.data.toDate().toLocaleDateString()}</Text>
                      <Text>Horário: {item.data.toDate().toLocaleTimeString().slice(0, 5)}</Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}

            {aniversariantes.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>🎉 Aniversariantes de hoje:</Text>
                <FlatList
                  data={aniversariantes}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.card}
                      onPress={() =>
                        Linking.openURL(
                          `https://wa.me/55${item.telefone.replace(/\D/g, "")}?text=Parab%C3%A9ns%20${item.name}%20pelo%20seu%20anivers%C3%A1rio!%20🎉🎂`
                        )
                      }
                    >
                      <Text>Nome: {item.name}</Text>
                      <Text>Nascimento: {item.dataNasc.toDate().toLocaleDateString()}</Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}
          </>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: colors.secondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    marginBottom: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    padding: 10,
  },
});
