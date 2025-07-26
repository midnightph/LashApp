import colors from "@/src/colors";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, SafeAreaView } from "moti";
import React from "react";
import { Linking, Text, TouchableOpacity } from "react-native";

export default function Suporte({ navigation }: any) {
    return (
        <SafeAreaView style={{ flex: 1, padding: 20, paddingTop: 20, backgroundColor: colors.background }}>
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 500 }} style={{ 
                alignItems: 'center', 
                flexDirection: 'row' 
                }}>
                <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Voltar" style={{ marginRight: 10 }}>
                    <Ionicons name="arrow-back" size={35} color={colors.secondary}/>
                </TouchableOpacity>
                <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.secondary }}>Suporte</Text>
            </MotiView>
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 500 }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: colors.textDark, textAlign: 'center', marginBottom: 20 }}>
                    Caso haja alguma dúvida ou problema, você pode entrar em contato conosco através dos seguintes meios:
                </Text>
                <TouchableOpacity onPress={() => Linking.openURL('mailto:pedrorodacinski26@gmail.com')} accessibilityLabel="Enviar e-mail" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <Ionicons name="mail" size={25} color={colors.secondary} />
                    <Text style={{ fontSize: 18, color: colors.secondary }}>pedrorodacinski26@gmail.com</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('whatsapp://send?phone=5541998780288')} accessibilityLabel="Ligar" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Ionicons name="call" size={25} color={colors.secondary} />
                    <Text style={{ fontSize: 18, color: colors.secondary }}>+55 41 99878-0288</Text>
                </TouchableOpacity>
            </MotiView>
        </SafeAreaView>
    );
}