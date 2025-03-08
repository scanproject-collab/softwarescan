import { Stack, router } from 'expo-router';
import { StatusBar } from 'react-native';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeOneSignal } from './utils/oneSignal';
import { validateToken } from './utils/auth';

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
        initializeOneSignal().catch((error) => {
            console.error('Erro ao inicializar o OneSignal:', error);
        });
    }, []);

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
            <Stack>
                <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                />
                <Stack.Screen name="pages/auth/index" options={{ title: 'Login' }} />
                <Stack.Screen name="pages/auth/signup" options={{ title: 'Registro' }} />
                <Stack.Screen name="pages/auth/recovery" options={{ title: 'Recuperar Senha' }} />
                <Stack.Screen name="pages/users/interaction/[id]" options={{ title: 'Local' }} />
                <Stack.Screen name="pages/users/TestMap" options={{ title: 'Teste de Mapa' }} />
            </Stack>
        </>
    );
}