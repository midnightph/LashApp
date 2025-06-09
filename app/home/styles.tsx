import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    // CONTAINER PRINCIPAL
    container: {
        flex: 1,
        backgroundColor: '#FFF2F5',
    },

    // CABEÇALHO
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#E8B4B4',  // Rosa poá
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#888888',
    },

    // LISTA
    listContainer: {
        paddingLeft: 15,
    },

    // CARD CLIENTE
    clienteCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 15,
        width: 200,
        height: 250,
        marginBottom: 10,
        marginRight: 15,
        alignItems: 'center',

        // Sombra iOS
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,

        // Sombra Android
        elevation: 6,
    },
    clientImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 12,
    },
    clienteNome: {
        color: '#5A5A5A',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    clienteProcedimento: {
        color: '#E8B4B4',
        fontSize: 14,
        fontWeight: '500',
    },
    clienteData: {
        color: '#888888',
        fontSize: 12,
        marginTop: 6,
    },
    boxAddCliente: {
        marginLeft: 15,
        marginRight: 15,
        borderRadius: 20,
        backgroundColor: 'white',
        shadowColor: '#E8B4B4',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 5,
    },
    clienteInfo: {

    },

    clienteAtendimento: {
        color: 'green'
    }
    
});

export default styles;