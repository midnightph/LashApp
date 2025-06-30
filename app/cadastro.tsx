import { Timestamp } from 'firebase/firestore';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
} from 'react-native';
import MaskInput, { Masks } from 'react-native-mask-input';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import colors from '../src/colors';
import FormButton from '@/src/FormButton';
import { MotiView, MotiText } from 'moti';

export default function Cadastro({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');

  const telefoneRef = useRef<TextInput>(null);
  const dataNascRef = useRef<TextInput>(null);

  const finalizar = () => {
    if (!nomeCompleto || !telefone || dataNasc.length !== 10) {
      return Toast.show({
        type: 'error',
        text1: 'Preencha todos os campos corretamente!',
        position: 'bottom',
      });
    }

    const [primeiroNome, ...resto] = nomeCompleto.split(' ');
    setNome(primeiroNome);
    setSobrenome(resto.join(' '));

    const partes = dataNasc.split('/');
    const dataConvertida = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
    const data = Timestamp.fromDate(dataConvertida);

    navigation.navigate('FinalizarCad', { nome, sobrenome, telefone, data });
  };

  return (
    <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="dark-content" backgroundColor="#FFF2F5" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <MotiText
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100, type: 'timing' }}
            style={styles.title}
          >
            Cadastre-se
          </MotiText>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200, type: 'timing' }}
            style={{ width: '100%' }}
          >
            <TextInput
              placeholder="Nome completo"
              placeholderTextColor={colors.secondary}
              style={styles.input}
              value={nomeCompleto}
              onChangeText={setNomeCompleto}
              returnKeyType="next"
              onSubmitEditing={() =>
                setTimeout(() => telefoneRef.current?.focus(), 500)
              }
            />
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300, type: 'timing' }}
            style={{ width: '100%' }}
          >
            <MaskInput
              value={telefone}
              style={styles.input}
              keyboardType="phone-pad"
              onChangeText={(masked, unmasked) => setTelefone(unmasked)}
              mask={Masks.BRL_PHONE}
              placeholder="Telefone"
              placeholderTextColor={colors.secondary}
              ref={telefoneRef}
              returnKeyType="next"
              onSubmitEditing={() =>
                setTimeout(() => dataNascRef.current?.focus(), 500)
              }
            />
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400, type: 'timing' }}
            style={{ width: '100%' }}
          >
            <MaskInput
              value={dataNasc}
              style={styles.input}
              keyboardType="numeric"
              onChangeText={(masked) => setDataNasc(masked)}
              mask={Masks.DATE_DDMMYYYY}
              placeholder="Data de nascimento"
              placeholderTextColor={colors.secondary}
              ref={dataNascRef}
              returnKeyType="done"
              onSubmitEditing={finalizar}
            />
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500, type: 'timing' }}
            style={{ width: '100%' }}
          >
            <FormButton title="Finalizar cadastro" onPress={finalizar} />
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: colors.cardBackground,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
