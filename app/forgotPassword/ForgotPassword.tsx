import colors from "@/src/colors";
import { getAuth } from "firebase/auth";
import { MotiText } from "moti";
import { ActivityIndicator, ImageBackground, SafeAreaView, Text, TextInput, Touchable, TouchableOpacity, View } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth/react-native";
import { useState } from "react";
import Toast from "react-native-toast-message";

export default function ForgotPassword() {

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
        } catch (error: any) {
            const mensagem = traduzirErroFirebase(error.code);
            Toast.show({ type: 'error', text1: mensagem, position: 'bottom' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <ImageBackground source={require('../images/background.png')} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
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
                        borderColor: colors.primary,
                    }}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                />
                {loading ? (
                    <ActivityIndicator size="large" color={colors.background} />
                ) : (
                    <TouchableOpacity onPress={forgotPassword}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.background }}>Recuperar senha</Text>
                </TouchableOpacity>
                )}
                
            </SafeAreaView>
        </ImageBackground>
    );
}