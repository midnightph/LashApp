import colors from '@/src/colors';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF2F5',
    },
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
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        marginTop: 10,
        borderColor: colors.background,
        fontSize: 16,
    },
    subtitle: {
        fontSize: 18,
        color: colors.title,
    },
    clienteContainer: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        shadowColor: '#E8B4B4',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 15,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    clienteImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
    },
    clienteNome: {
        display: 'flex',        
        justifyContent: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    clienteProcedimento: {
        fontSize: 15,
        color: colors.textDark,
    },
    clienteInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5
    },
    clienteData: {
        fontSize: 15,
        color: '#888888',
    },
    clienteAtendimento: {
        color: 'green',
        display: 'flex',
        textAlign: 'right'
    }
});

export default styles;