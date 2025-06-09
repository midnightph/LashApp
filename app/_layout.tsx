import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ClientesProvider } from '../src/screens/functions/ClientesContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './index';
import HomeScreen from './home/HomeScreen'; // ajuste se necessário

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ClientesProvider>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ title: 'Home', headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Home" component={HomeScreen} />
            {/* Adicione outras telas aqui */}
          </Stack.Navigator>
      </ClientesProvider>
    </SafeAreaProvider>
  );
}
