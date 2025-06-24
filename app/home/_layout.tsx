import { ClientesProvider } from '@/src/screens/functions/ClientesContext';
import { createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Tabs } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DetalhesCliente from '../cliente/DetalhesCliente';
import HomeScreen from './HomeScreen'
import AddCliente from '@/src/screens/functions/addCliente';

const Stack = createNativeStackNavigator();

export default function Layout() {
  return (
    <SafeAreaProvider>
          <ClientesProvider>
              <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="DetalhesCliente" component={DetalhesCliente} />
                <Stack.Screen name="AddCliente" component={AddCliente} />
              </Stack.Navigator>
          </ClientesProvider>
      </SafeAreaProvider>
  );
}
