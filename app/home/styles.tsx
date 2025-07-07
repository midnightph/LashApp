import colors from '@/src/colors';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // CONTAINER PRINCIPAL
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // CABEÇALHO
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,  // usei dourado claro
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.secondary,
  },
  
  boxAddCliente: {
    marginLeft: 15,
    marginRight: 15,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },

  
});

export default styles;
