import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'react-native';
import { useEffect, useState } from 'react';
import { initializeOneSignalNotification } from './utils/OneSignalNotification';
import { validateToken } from '@/src/app/utils/ValidateAuth';
import React from 'react';
import { LoadingScreen } from './components/LoadingScreen';

export default function RootLayout() {
  const segments = useSegments();
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      if (initialCheckDone) return; // Evita reexecução

      try {
        await initializeOneSignalNotification();
        const isValid = await validateToken();
        setIsCheckingToken(false);
        setInitialCheckDone(true);

        if (!isValid) {
          setShouldNavigate('/pages/auth');
        } else if (segments.length === 0 || (segments[0] === 'pages' && segments[1] === 'auth')) {
          setShouldNavigate('/');
        }
      } catch (error) {
        console.error('Erro ao inicializar o app:', error);
        setIsCheckingToken(false);
        setInitialCheckDone(true);
      }
    };

    initializeApp();
  }, []); // Dependências vazias para executar apenas uma vez

  useEffect(() => {
    if (shouldNavigate && !isCheckingToken) {
      router.replace(shouldNavigate);
    }
  }, [shouldNavigate, isCheckingToken]);

  if (isCheckingToken) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#092B6E" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pages/auth/index" options={{ title: 'Login' }} />
        <Stack.Screen name="pages/auth/SignUp" options={{ title: 'Registro' }} />
        <Stack.Screen name="pages/auth/Recovery" options={{ title: 'Recuperar Senha' }} />
        <Stack.Screen name="pages/auth/PasswordRecoveryRequestScreen" options={{ title: 'Recuperação Bem-Sucedida' }} />
        <Stack.Screen name="pages/auth/PasswordResetCodeVerificationScreen" options={{ title: 'Verificar Código' }} />
        <Stack.Screen name="pages/auth/PasswordResetScreen" options={{ title: 'Redefinir Senha' }} />
        <Stack.Screen name="pages/posts/[id]" options={{ title: 'Local' }} />
        <Stack.Screen name="pages/users/ProfileUser" options={{ title: 'Perfil' }} />
        <Stack.Screen name="pages/users/ProfileEditUser" options={{ title: 'Editar Perfil' }} />
      </Stack>
    </>
  );
}