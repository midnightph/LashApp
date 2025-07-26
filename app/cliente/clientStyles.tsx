import colors from '@/src/colors';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.secondary,
    marginBottom: 6,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3A3A3A80',
    marginBottom: 12,
  },
  input: {
    height: 50,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 15,
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 18,
    paddingLeft: 40,
  },
  listContent: {
    paddingBottom: 30,
  },
  clienteContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    justifyContent: 'space-between',
  },
  clienteImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  clienteInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  clienteNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 4,
    maxWidth: 140,
  },
  clienteProcedimento: {
    fontSize: 15,
    color: colors.textDark,
  },
  clienteData: {
    fontSize: 13,
    color: '#888888',
    marginTop: 6,
  },
  statusContainer: {
    minWidth: 100,
    alignItems: 'flex-end',
  },
  clienteAtendimento: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 14,
  },
  clienteAtendimentoHidden: {
    fontSize: 14,
    opacity: 0,
  },
});

export default styles;
