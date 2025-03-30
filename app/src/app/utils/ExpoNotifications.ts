import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function initializeExpoNotification() {
  try {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permissões de notificação não concedidas');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    })).data;

    await AsyncStorage.setItem('playerId', token);
    console.log('PlayerId registrado:', token);  
    return token;
  } catch (error) {
    console.error('Erro ao inicializar notificações:', error.message);
    return null;
  }
}

export async function getPlayerId() {
  const playerId = await AsyncStorage.getItem('playerId');
  console.log('PlayerId recuperado do AsyncStorage:', playerId);  
  return playerId;
}
