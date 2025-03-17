import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function initializeExpoNotification() {

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
    projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || '2ad9aa1c-f80d-4558-8a5a-d02752d160e3',
  })).data;


  await AsyncStorage.setItem('playerId', token);
  console.log('PlayerId registrado:', token);
  return token;
}

export async function getPlayerId() {
  return await AsyncStorage.getItem('playerId');
}