// src/screens/CuidadosScreen.tsx

import colors from '@/src/colors';
import { auth, database } from '@/src/firebaseConfig';
import FormButton from '@/src/FormButton';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { MotiView, AnimatePresence } from 'moti';

export default function Procedimentos({ navigation }: any) {
  const [procedimento, setProcedimento] = useState('');
  const [cuidados, setCuidados] = useState('');
  const [procedimentos, setProcedimentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProcedimentos();
  }, []);

  const fetchProcedimentos = async () => {
    try {
      setLoading(true);
      const procedimentosCollection = collection(database, 'user', auth.currentUser.uid, 'Cuidados');
      const procedimentosSnapshot = await getDocs(procedimentosCollection);
      const lista = procedimentosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProcedimentos(lista);
    } catch (error) {
      console.log('Erro ao buscar procedimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarProcedimento = async () => {
    if (!auth.currentUser) return;

    if (!procedimento.trim() || !cuidados.trim()) {
      return Toast.show({
        type: 'error',
        text1: 'Preencha os campos obrigatórios',
        position: 'bottom',
      });
    }

    const novoProcedimento = {
      procedimento: procedimento.trim(),
      cuidados: cuidados.trim(),
    };

    try {
      const docRef = await addDoc(collection(database, 'user', auth.currentUser.uid, 'Cuidados'), novoProcedimento);
      setProcedimentos((prev) => [...prev, { id: docRef.id, ...novoProcedimento }]);
      setProcedimento('');
      setCuidados('');
      Toast.show({ type: 'success', text1: 'Procedimento adicionado com sucesso!', position: 'bottom' });
    } catch (error) {
      console.log(error);
      Toast.show({ type: 'error', text1: 'Erro ao adicionar procedimento', position: 'bottom' });
    }
  };

  const excluirProcedimento = async (id: string) => {
    Alert.alert('Excluir', 'Deseja excluir este procedimento?', [
      {
        text: 'Sim',
        onPress: async () => {
          try {
            await deleteDoc(doc(database, 'user', auth.currentUser.uid, 'Cuidados', id));
            setProcedimentos((prev) => prev.filter((item) => item.id !== id));
            Toast.show({ type: 'success', text1: 'Procedimento excluído', position: 'bottom' });
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Erro ao excluir procedimento', position: 'bottom' });
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <ImageBackground source={require('../images/background.png')} style={styles.background}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={90}
        >
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.secondary} />
            </View>
          ) : (
            <FlatList
              data={procedimentos}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.container}
              ListHeaderComponent={
                <>
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                    <Ionicons name="arrow-back" size={28} color={colors.secondary} />
                  </TouchableOpacity>

                  <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 100, type: 'timing', duration: 400 }}
                  >
                    <Text style={styles.title}>Cuidados e Procedimentos</Text>
                  </MotiView>

                  <MotiView
                    from={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 200, type: 'timing', duration: 300 }}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="Procedimento"
                      value={procedimento}
                      onChangeText={setProcedimento}
                      placeholderTextColor={colors.title}
                    />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Cuidados"
                      multiline
                      value={cuidados}
                      onChangeText={setCuidados}
                      placeholderTextColor={colors.title}
                    />
                    <FormButton title="Adicionar" onPress={adicionarProcedimento} />
                  </MotiView>

                  <Text style={styles.listTitle}>Procedimentos cadastrados:</Text>
                </>
              }
              ListEmptyComponent={
                <Text style={styles.empty}>Nenhum procedimento ainda.</Text>
              }
              renderItem={({ item }) => (
                <AnimatePresence>
                  <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'timing', duration: 300 }}
                    style={styles.item}
                  >
                    <TouchableOpacity onPress={() => excluirProcedimento(item.id)}>
                      <Text style={styles.itemTitle}>{item.procedimento}</Text>
                      <Text style={styles.itemText}>{item.cuidados}</Text>
                    </TouchableOpacity>
                  </MotiView>
                </AnimatePresence>
              )}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.background },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: { padding: 20, paddingBottom: 40 },
  back: { marginBottom: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.secondary, marginBottom: 20 },
  input: {
    backgroundColor: colors.textLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    color: colors.textDark,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.secondary,
    marginTop: 24,
    marginBottom: 10,
  },
  empty: { textAlign: 'center', color: colors.title, fontStyle: 'italic', marginTop: 40 },
  item: {
    backgroundColor: colors.textLight,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 10,
  },
  itemTitle: { fontWeight: 'bold', fontSize: 16, color: colors.primaryDark, marginBottom: 5 },
  itemText: { fontSize: 15, color: colors.textDark },
});
