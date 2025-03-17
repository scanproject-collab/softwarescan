import { Stack, router } from 'expo-router';
import { StatusBar } from 'react-native';
import { useEffect } from 'react';
import { initializeExpoNotification } from './utils/expoNotifications';
import { validateToken } from './utils/auth';
import React from 'react';

export default function RootLayout() {
  useEffect(() => {
    const checkToken = async () => {
      const isValid = await validateToken();
      if (!isValid) {
        console.log('Token inválido ou expirado, redirecionando para login');
        router.replace('/pages/auth');
      }
    };

    checkToken();
    initializeExpoNotification().catch((error) => {
      console.error('Erro ao inicializar o OneSignal:', error);
    });
  }, []);

  return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
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