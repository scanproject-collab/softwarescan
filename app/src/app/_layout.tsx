import { Stack, router, useSegments } from 'expo-router';
import { StatusBar, View, Button, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { initializeOneSignalNotification } from './utils/OneSignalNotification';
import { validateToken } from '@/src/app/utils/ValidateAuth';
import React from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from 'react-error-boundary';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reverseGeocode } from '@/src/app/utils/GoogleMaps';
import NetInfo from "@react-native-community/netinfo";
import Toast from 'react-native-toast-message';


function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ color: 'red', fontSize: 16, marginBottom: 10 }}>Algo deu errado:</Text>
      <Text style={{ color: 'red', marginBottom: 20 }}>{error.message}</Text>
      <Button onPress={resetErrorBoundary} title="Tentar novamente" />
    </View>
  );
}

export default function RootLayout() {
  const segments = useSegments();
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState<string | null>(null);

  // Function to request location permissions and get current location
  const initializeLocation = async () => {
    try {
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Permissão de localização não concedida pelo usuário");
        return null;
      }

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (locationData && locationData.coords) {
        const { latitude, longitude } = locationData.coords;
        console.log("Coordenadas obtidas no _layout:", latitude, longitude);

        // Store coordinates in AsyncStorage for later use
        await AsyncStorage.setItem('userLocation', JSON.stringify({ latitude, longitude }));
        await AsyncStorage.setItem('userLocationTimestamp', Date.now().toString());

        return { latitude, longitude };
      }
    } catch (error) {
      console.error("Erro ao inicializar localização:", error);
    }
    return null;
  };

  // Function to perform reverse geocoding and cache the result
  const cacheLocationAddress = async (coords) => {
    if (!coords) return;

    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.log("Sem conexão para geocoding no inicializar");
        return;
      }

      const { latitude, longitude } = coords;
      const address = await reverseGeocode(latitude, longitude);

      if (address && !address.includes("Erro")) {
        console.log("Endereço obtido e armazenado no _layout:", address);
        await AsyncStorage.setItem('userLocationAddress', address);
      }
    } catch (error) {
      console.error("Erro ao fazer geocoding no inicializar:", error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      if (initialCheckDone) return;

      try {
        // Start multiple initialization tasks in parallel
        const notificationPromise = initializeOneSignalNotification();
        const tokenPromise = validateToken();

        // Start location initialization in parallel, but don't wait for it
        initializeLocation().then(coords => {
          if (coords) {
            cacheLocationAddress(coords);
          }
        });

        // Wait for critical tasks to complete
        const [_, isValid] = await Promise.all([
          notificationPromise,
          tokenPromise
        ]);

        setIsCheckingToken(false);
        setInitialCheckDone(true);

        // Check if we're in the verification flow
        const isInVerificationFlow =
          segments.length > 1 &&
          segments[0] === 'pages' &&
          segments[1] === 'auth' &&
          (segments.includes('SignUp') ||
            segments.includes('PasswordResetCodeVerificationScreen') ||
            segments.includes('PasswordRecoveryRequestScreen') ||
            segments.includes('PasswordResetScreen') ||
            segments.includes('Recovery'));

        // Only redirect if not in verification flow
        if (!isValid && !isInVerificationFlow) {
          setShouldNavigate('/pages/auth');
        } else if (isValid && segments.length === 0) {
          // Only redirect to home if at root and has valid token
          setShouldNavigate('/');
        }
      } catch (error) {
        console.error('Erro ao inicializar o app:', error);
        setIsCheckingToken(false);
        setInitialCheckDone(true);
      }
    };

    initializeApp();
  }, [initialCheckDone, segments]);

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