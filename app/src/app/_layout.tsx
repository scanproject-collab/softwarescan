import { Stack, router, useSegments } from 'expo-router';
import { StatusBar, View, Button, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { initializeOneSignalNotification } from './utils/OneSignalNotification';
import { validateToken } from '@/src/app/utils/ValidateAuth';
import React from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({error, resetErrorBoundary}) {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
      <Text style={{color: 'red', fontSize: 16, marginBottom: 10}}>Algo deu errado:</Text>
      <Text style={{color: 'red', marginBottom: 20}}>{error.message}</Text>
      <Button onPress={resetErrorBoundary} title="Tentar novamente" />
    </View>
  );
}

export default function RootLayout() {
  const segments = useSegments();
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      if (initialCheckDone) return; 

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
  }, [initialCheckDone]); 

  useEffect(() => {
    if (shouldNavigate && !isCheckingToken) {
      router.replace(shouldNavigate); 
    }
  }, [shouldNavigate, isCheckingToken]);

  if (isCheckingToken) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Ação de reset quando o usuário clicar em "Tentar novamente"
        router.replace('/');
      }}
    >
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
    </ErrorBoundary>
  );
}