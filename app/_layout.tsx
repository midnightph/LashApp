import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ClientesProvider } from '../src/screens/functions/ClientesContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './index';
import HomeScreen from './home/HomeScreen';
import Mapping from "./home/Mapping";
import ClienteScreen from "./cliente/ClienteScreen";
import Profile from "./home/Profile";
import DetalhesCliente from "./cliente/DetalhesCliente";
import Cadastro from './cadastro'
import FinalizarCad from './FinalizarCad'
import Toast from 'react-native-toast-message';
import DetalhesMapping from "./cliente/DetalhesMapping";
const Stack = createNativeStackNavigator();
import * as NavigationBar from 'expo-navigation-bar';
const Tab = createBottomTabNavigator();

import { Home, Users, User } from 'lucide-react-native';
import { View } from 'react-native';
import { useEffect } from "react";

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: '#FF69B4',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          position: 'absolute',
          bottom: -10,
          left: 20,
          right: 20,
          backgroundColor: '#fff',
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          height: 70,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
          borderTopWidth: 0,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconSize = focused ? size + 4 : size;

          let Icon;
          if (route.name === 'Home') Icon = Home;
          else if (route.name === 'ClienteScreen') Icon = Users;
          else if (route.name === 'Profile') Icon = User;

          return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Icon color={color} size={iconSize} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="ClienteScreen" component={ClienteScreen} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}




export default function RootLayout() {
  useEffect(() => {
    NavigationBar.setBackgroundColorAsync('#FF69B4'); // cor da barra
    NavigationBar.setButtonStyleAsync('light'); // cor dos botões: 'light' ou 'dark'
  }, []);
  return (
    <SafeAreaProvider>
      <ClientesProvider>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen name="DetalhesCliente" component={DetalhesCliente} />
            <Stack.Screen name="Mapping" component={Mapping} />
            <Stack.Screen name='Profile' component={Profile} />
            <Stack.Screen name='Cadastro' component={Cadastro} />
            <Stack.Screen name='FinalizarCad' component={FinalizarCad} />
            <Stack.Screen name="DetalhesMapping" component={DetalhesMapping} />
          </Stack.Navigator>
          <Toast />
      </ClientesProvider>
    </SafeAreaProvider>
  );
}

