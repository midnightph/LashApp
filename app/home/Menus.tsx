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
import { MotiView } from "moti";

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

  // Componente para animação do botão
  function AnimatedMenuButton({ onPress, icon: Icon, label, delay = 0 }: { onPress: () => void, icon: any, label: string, delay?: number }) {
    const [pressed, setPressed] = useState(false);
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={{ maxWidth: '49%', maxHeight: 150, minWidth: '49%', minHeight: 150 }}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.8, rotateZ: '0deg' }}
          animate={{ opacity: 1, scale: pressed ? 0.95 : 1, rotateZ: pressed ? '5deg' : '0deg' }}
          transition={{ type: 'timing', duration: 300, delay }}
          style={[styles.menus]}
        >
          <Icon size={40} color='#E8B4B4' />
          <Text style={styles.title}>{label}</Text>
        </MotiView>
      </TouchableOpacity>
    );
  }

  return (
    <ImageBackground source={require('../images/background.png')} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <AnimatedMenuButton
              icon={Users}
              label="Clientes"
              onPress={() => navigation.navigate('DetalhesCliente')}
              delay={100}
            />
            <AnimatedMenuButton
              icon={User}
              label="Perfil"
              onPress={() => navigation.navigate('Profile', { nome, telefone })}
              delay={200}
            />
            <AnimatedMenuButton
              icon={NotebookIcon}
              label="Lembretes"
              onPress={() => navigation.navigate('Lembretes')}
              delay={300}
            />
            <AnimatedMenuButton
              icon={Calendar}
              label="Agenda"
              onPress={() => navigation.navigate('Agenda')}
              delay={400}
            />
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
    marginTop: 8,
    textAlign: 'center'
  },
  menus: {
    backgroundColor: colors.cardBackground,  // Rosa poá
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.secondary,
    gap: 10,
    flex: 1,
  }
});
