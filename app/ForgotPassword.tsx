import colors from "@/src/colors";
import { getAuth } from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth/react-native";
import { MotiText } from "moti";
import { useState } from "react";
import { ActivityIndicator, ImageBackground, SafeAreaView, Text, TextInput, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native";

export default function ForgotPassword({navigation} : any) {

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const traduzirErroFirebase = (code: string) => {
        switch (code) {
            case 'auth/invalid-email':
                return 'E-mail inválido.';
            case 'auth/user-not-found':
                return 'E-mail não encontrado.';
            default:
                return 'Ocorreu um erro ao enviar o email de recuperação de senha.';
        }
    }

    const forgotPassword = async () => {
        const auth = getAuth();
        if(!email) {
            Toast.show({ type: 'error', text1: 'Preencha todos os campos!', position: 'bottom' });
            return;
        }
        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, email);
            Toast.show({ type: 'success', text1: 'Email enviado com sucesso!', position: 'bottom' });
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                    } catch (error: any) {
            const mensagem = traduzirErroFirebase(error.code);
            Toast.show({ type: 'error', text1: mensagem, position: 'bottom' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <ImageBackground source={require('./images/background.png')} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '85%', gap: 10 }}>
                <MotiText from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 1000 }} style={{ fontSize: 28, fontWeight: 'bold', color: colors.secondary }}>Esqueci minha senha</MotiText>
                <TextInput
                    placeholder="E-mail"
                    placeholderTextColor={colors.primary}
                    style={{
                        width: '100%',
                        height: 50,
                        backgroundColor: colors.background,
                        borderRadius: 20,
                        paddingHorizontal: 16,
                        color: colors.textDark,
                        borderWidth: 2,
                        borderColor: colors.secondary,
                    }}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                />
                <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={forgotPassword} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.secondary} />
              ) : (
                <Text style={styles.buttonText}>Recuperar senha</Text>
              )}
            </TouchableOpacity>
                
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: '85%',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: colors.textDark,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.background,
  },
});
