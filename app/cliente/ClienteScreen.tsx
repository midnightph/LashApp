import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';

import styles from '../cliente/clientStyles';
import { useClientes } from '../../src/screens/functions/ClientesContext';
import colors from '@/src/colors';

export default function ClienteScreen({ navigation }: any) {
  const [termoBusca, setTermoBusca] = useState('');
  const { clientes, carregarClientes } = useClientes();

  useEffect(() => {
    carregarClientes();
  }, []);

  const filterClientes = () => {
    return clientes.filter(cliente =>
      cliente.name.toLowerCase().includes(termoBusca.toLowerCase())
    );
  };

  return (
    <ImageBackground source={require('../images/background.png')} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex1}
        >
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 800 }}
            style={styles.container}
          >
            <Text style={styles.title}>Clientes</Text>
            <Text style={styles.subtitle}>Pesquise por nome:</Text>
            <TextInput
              style={styles.input}
              value={termoBusca}
              onChangeText={setTermoBusca}
              placeholder="Digite o nome do cliente"
              placeholderTextColor={colors.title}
              accessibilityLabel="Campo para buscar clientes por nome"
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />

            <FlatList
              data={filterClientes()}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.clienteContainer}
                  onPress={() => navigation.navigate('DetalhesCliente', { cliente: item })}
                  accessibilityRole="button"
                  accessibilityLabel={`Detalhes do cliente ${item.name}`}
                >
                  <Image source={{ uri: item.foto }} style={styles.clienteImage} />
                  <View style={styles.clienteInfo}>
                    <Text style={styles.clienteNome} numberOfLines={1}>
                      {item.name.split(' ').slice(0, 2).join(' ')}
                    </Text>
                    <Text style={styles.clienteProcedimento}>{item.proc}</Text>
                    <Text style={styles.clienteData}>
                      {item.dataNasc.toDate().toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  <View style={styles.statusContainer}>
                    {item.statusProc ? (
                      <Text style={styles.clienteAtendimento}>Em atendimento</Text>
                    ) : (
                      <Text style={styles.clienteAtendimentoHidden}> </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          </MotiView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
