import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'react-native';
import { useEffect, useState } from 'react';
import { initializeExpoNotification } from './utils/expoNotifications';
import { validateToken } from './utils/validateAuth';
import React from 'react';
import { LoadingScreen } from './components/LoadingScreen';

export default function RootLayout() {
  const segments = useSegments();
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    const checkTokenAndRedirect = async () => {
      const isValid = await validateToken();
      setIsCheckingToken(false);
      setInitialCheckDone(true);

      if (!isValid) {
        router.replace('/pages/auth');
      } else if (segments.length === 0 || (segments[0] === 'pages' && segments[1] === 'auth')) {
        router.replace('/');
      }
    };

    if (!initialCheckDone) {
      checkTokenAndRedirect();
    }

    initializeExpoNotification().catch((error) => {
      console.error('Erro ao inicializar notificações:', error);
    });
  }, [initialCheckDone]);

  if (isCheckingToken) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#092B6E" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pages/auth/index" options={{ title: 'Login' }} />
        <Stack.Screen name="pages/auth/signup" options={{ title: 'Registro' }} />
        <Stack.Screen name="pages/auth/recovery" options={{ title: 'Recuperar Senha' }} />
        <Stack.Screen name="components/auth/passwordRecoverySuccessScreen" options={{ title: 'Recuperação Bem-Sucedida' }} />
        <Stack.Screen name="components/auth/passwordResetCodeVerificationScreen" options={{ title: 'Verificar Código' }} />
        <Stack.Screen name="components/auth/passwordResetScreen" options={{ title: 'Redefinir Senha' }} />
        <Stack.Screen name="pages/users/interaction/[id]" options={{ title: 'Local' }} />
        <Stack.Screen name="pages/users/profile" options={{ title: 'Perfil' }} />
        <Stack.Screen name="pages/users/profileEdit" options={{ title: 'Editar Perfil' }} />
      </Stack>
    </>
  );
}
