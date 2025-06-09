import { ClientesProvider } from '@/src/screens/functions/ClientesContext';
import { Stack, Tabs } from 'expo-router';

export default function Layout() {
  return (
    <ClientesProvider>
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="HomeScreen" options={{ title: 'Home', headerShown: false }} />
      <Tabs.Screen name="ClienteScreen" options={{ title: 'ClienteScreen', headerShown: false }} />
    </Tabs>
    </ClientesProvider>
  );
}
