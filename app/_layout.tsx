import colors from "@/src/colors";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as NavigationBar from 'expo-navigation-bar';
import { Home, Menu, Users } from 'lucide-react-native';
import { MotiView } from "moti";
import { useEffect } from "react";
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ClientesProvider } from '../src/screens/functions/ClientesContext';
import Agenda from "./agenda/Agenda";
import Cadastro from './cadastro';
import AI from "./cliente/Ai";
import ClienteScreen from "./cliente/ClienteScreen";
import DetalhesCliente from "./cliente/DetalhesCliente";
import DetalhesMapping from "./cliente/DetalhesMapping";
import EditarCliente from "./cliente/EditarCliente";
import FinalizarCad from './FinalizarCad';
import ForgotPassword from "./forgotPassword/ForgotPassword";
import HomeScreen from './home/HomeScreen';
import Mapping from "./home/Mapping";
import Menus from "./home/Menus";
import Profile from "./home/Profile";
import Login from './index';
import Lembretes from "./lembretes/Lembretes";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
          const iconColor = focused ? colors.secondary : colors.primary;
          let Icon;
          if (route.name === 'Home') Icon = Home;
          else if (route.name === 'ClienteScreen') Icon = Users;
          else if (route.name === 'Menus') Icon = Menu;

          if (!Icon) return null;

          const animatedIcon = (
            <MotiView
              from={{ rotate: '0deg' }}
              animate={{ rotate: focused ? '360deg' : '0deg' }}
              transition={{ type: 'timing', duration: 500 }}
            >
              <Icon color={iconColor} size={iconSize} />
            </MotiView>
          );

          return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              {route.name === 'Menus' ? animatedIcon : <Icon color={iconColor} size={iconSize} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="ClienteScreen" component={ClienteScreen} />
      <Tab.Screen name="Menus" component={Menus} />
    </Tab.Navigator>
  );
}

export default function RootLayout() {
  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(colors.background); // cor da barra
    NavigationBar.setButtonStyleAsync('light'); // cor dos botões: 'light' ou 'dark'
  }, []);
  
  return (
    <SafeAreaProvider>
      <ClientesProvider>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name='Ai' component={AI} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="DetalhesCliente" component={DetalhesCliente} />
          <Stack.Screen name="Mapping" component={Mapping} />
          <Stack.Screen name='Menu' component={Menus} />
          <Stack.Screen name='Profile' component={Profile} />
          <Stack.Screen name='Cadastro' component={Cadastro} />
          <Stack.Screen name='FinalizarCad' component={FinalizarCad} />
          <Stack.Screen name="DetalhesMapping" component={DetalhesMapping} />
          <Stack.Screen name='Agenda' component={Agenda} />
          <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
          <Stack.Screen name='EditarCliente' component={EditarCliente} />
          <Stack.Screen name='Lembretes' component={Lembretes} />
        </Stack.Navigator>
        <Toast />
      </ClientesProvider>
    </SafeAreaProvider>
  );
}
