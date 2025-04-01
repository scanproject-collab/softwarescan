import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { OneSignal } from 'react-native-onesignal';

async function initializeExpoNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }
  return true;
}

async function getPushSubscriptionId() {
  try {
    const subscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
    if (subscriptionId) {
      console.log('OneSignal Push Subscription ID:', subscriptionId);
      await AsyncStorage.setItem('playerId', subscriptionId);
      return subscriptionId;
    } else {
      console.log('OneSignal Push Subscription ID não disponível ainda.');
      return null;
    }
  } catch (error) {
    console.error('Erro ao obter o ID de subscrição push:', error);
    return null;
  }
}

export async function initializeOneSignalNotification() {
  try {
    const permissionsGranted = await initializeExpoNotifications();
    if (!permissionsGranted) {
      return null;
    }
    OneSignal.initialize('85a27f07-2069-4cae-94ac-e85afa04d321');

    // Adicionar listener para mudanças na subscrição
    OneSignal.User.pushSubscription.addEventListener('change', (subscription) => {
      if (subscription?.id) {
        const playerId = subscription.id;
        console.log('OneSignal Push Subscription ID changed:', playerId);
        AsyncStorage.setItem('playerId', playerId);
      }
    });

    // Obter o ID de subscrição push usando getIdAsync
    const pushSubscriptionId = await getPushSubscriptionId();
    return pushSubscriptionId;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro ao inicializar OneSignal/Notifications:', error.message);
    } else {
      console.error('Erro desconhecido ao inicializar OneSignal/Notifications:', error);
    }
    return null;
  }
}

export async function getPlayerId() {
  const playerId = await AsyncStorage.getItem('playerId');
  console.log('PlayerId recuperado do AsyncStorage:', playerId);
  return playerId;
}