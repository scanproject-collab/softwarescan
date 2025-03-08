import { Stack, router } from 'expo-router';
import { StatusBar } from 'react-native';
import { useEffect } from 'react';

import Navbar from './components/Navbar';
import Footer from './components/footer';
import { initializeOneSignal } from './utils/oneSignal';
import { validateToken } from './utils/auth';

export default function RootLayout() {
  useEffect(() => {
    const checkToken = async () => {
      const isValid = await validateToken();
      if (!isValid) {
        console.log('Token inválido ou expirado, redirecionando para login');
      }
    };

    checkToken();
    initializeOneSignal().catch((error) => {
      console.error('Erro ao inicializar o OneSignal:', error);
    });
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      <Stack
        screenOptions={({ route }) => {
          const showNavbar = [
            'index',
            'pages/users/interaction/[id]',
            'pages/users/interaction/newInteraction',
          ].includes(route.name);

          return {
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleAlign: 'center',
            headerLeft: () => (showNavbar ? <Navbar /> : null),
            headerRight: () => (showNavbar ? null : undefined),
          };
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Scan' }} />
        <Stack.Screen name="pages/auth/index" options={{ title: 'Login' }} />
        <Stack.Screen name="pages/users/interaction/[id]" options={{ title: 'Local' }} />
        <Stack.Screen name="pages/auth/signup" options={{ title: 'Registro' }} />
        <Stack.Screen name="pages/users/interaction/newInteraction" options={{ title: 'Nova Interação' }} />
        <Stack.Screen name="pages/auth/recovery" options={{ title: 'Recuperar Senha' }} />
          <Stack.Screen name="pages/users/interaction/myPerceptions" options={{ title: 'Minhas Perçepções' }} />

      </Stack>
      <Footer />
    </>
  );
}