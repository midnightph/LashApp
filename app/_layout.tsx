import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ClientesProvider } from '../src/screens/functions/ClientesContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './index';
import { Ionicons } from 'react-native-vector-icons';
import HomeScreen from './home/HomeScreen';
import Mapping from "./home/Mapping";
import ClienteScreen from "./cliente/ClienteScreen";
import Profile from "./home/Profile";
import DetalhesCliente from "./cliente/DetalhesCliente";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false, // Ocultar o texto das tabs
        headerShown: false, // Ocultar o header para não duplicar com o header das screens
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='home' size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="ClienteScreen" 
        component={ClienteScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='person' size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={Profile} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='person' color={color} size={size} />
          ),
        }}
      />
      {/* Não incluímos 'DetalhesCliente' nas tabs */}
    </Tab.Navigator>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ClientesProvider>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Tabs" component={TabNavigator} />
            {/* A tela de detalhes de cliente é acessada fora das tabs */}
            <Stack.Screen name="DetalhesCliente" component={DetalhesCliente} />
            <Stack.Screen name="Mapping" component={Mapping} />
          </Stack.Navigator>
      </ClientesProvider>
    </SafeAreaProvider>
  );
}
