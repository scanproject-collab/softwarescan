import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function initializeOneSignal() {
  // Configurar comportamento das notificações
  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Solicitar permissões
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Permissões de notificação não concedidas');
    return null;
  }

  // Obter o playerId (Expo Push Token)
  // Usar o projectId do EAS, não o onesignalAppId
  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || 'your-eas-project-id-here',
  })).data;

  // Armazenar o playerId localmente
  await AsyncStorage.setItem('playerId', token);
  console.log('PlayerId registrado:', token);
  return token;
}

export async function getPlayerId() {
  return await AsyncStorage.getItem('playerId');
}