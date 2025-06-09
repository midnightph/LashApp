import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    boxAddCliente: {

    },
    addCliente: {
        paddingLeft: 15,
        color: '#5A5A5A',
        fontSize: 16,
        fontWeight: 600
    },
    dados: {
        backgroundColor: '#E8B4B4',
    },
    bigButton: {
        backgroundColor: 'white',
        marginHorizontal: 15,
        padding: 15,
        borderRadius: 20,
        shadowColor: '#E8B4B4',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 15
    },
    bigButtonText: {
        color: '#5A5A5A',
        fontSize: 16,
        fontWeight: 600,
    },
    formContainer: {
        marginLeft: 15,
        marginRight: 15,
        marginTop: 15,
        borderRadius: 20,
        backgroundColor: 'white',
        shadowColor: '#E8B4B4',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 5,
        paddingBottom: 10
    },
    textInput: {
        color: '#5A5A5A',
        fontSize: 16,
        fontWeight: 600,
        marginLeft: 15,
        marginTop: 15,
        marginBottom: 5,
    },
    input: {
        fontWeight: 600,
        marginLeft: 25,
    },
    textInput2: {
        color: '#5A5A5A',
        fontSize: 16,
        fontWeight: 600,
        marginLeft: 15,
        marginBottom: 5,
    },
    sendForm: {
        backgroundColor: '#E8B4B4',  // Cor do botão// Espaçamento dentro do botão
        borderRadius: 20,            // Bordas arredondadas
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        alignItems: 'center',
        padding: 10,
        margin: 10,
    },
    dateInput : {
        color: '#5A5A5A',
        fontSize: 16,
        fontWeight: 600,
        marginLeft: 25,
        marginBottom: 5,
    },
});

export default styles;