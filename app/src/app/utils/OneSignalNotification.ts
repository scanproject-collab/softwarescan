import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { OneSignal } from 'react-native-onesignal';
import { Platform } from 'react-native';

async function initializeExpoNotifications() {
  console.log('Inicializando permissões do Expo Notifications...');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('Status atual de permissão de notificação:', existingStatus);

    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      console.log('Solicitando permissão de notificação...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('Novo status de permissão:', finalStatus);
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão de notificação não concedida');
      return false;
    }

    console.log('Permissão de notificação concedida com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar permissões de notificação:', error);
    return false;
  }
}

async function getPushSubscriptionId() {
  try {
    console.log('Tentando obter ID de subscrição OneSignal...');

    // Aguardar um momento para garantir que o OneSignal tenha tempo para inicializar
    if (Platform.OS !== 'web') {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const subscriptionId = await OneSignal.User.pushSubscription.getIdAsync();

    if (subscriptionId) {
      console.log('OneSignal Push Subscription ID obtido com sucesso:', subscriptionId);
      await AsyncStorage.setItem('playerId', subscriptionId);
      return subscriptionId;
    } else {
      console.log('OneSignal Push Subscription ID não disponível ainda. Tentando novamente...');

      // Tentar novamente após um breve delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      const retryId = await OneSignal.User.pushSubscription.getIdAsync();

      if (retryId) {
        console.log('OneSignal Push Subscription ID obtido na segunda tentativa:', retryId);
        await AsyncStorage.setItem('playerId', retryId);
        return retryId;
      } else {
        console.log('Falha ao obter OneSignal ID mesmo após nova tentativa');
        return null;
      }
    }
  } catch (error) {
    console.error('Erro ao obter o ID de subscrição push:', error);
    return null;
  }
}

export async function initializeOneSignalNotification() {
  try {
    console.log('Iniciando processo de inicialização do OneSignal...');

    const permissionsGranted = await initializeExpoNotifications();
    if (!permissionsGranted) {
      console.log('Permissões de notificação não concedidas. Continuando mesmo assim...');
      // Continuar mesmo sem permissões para que o OneSignal seja inicializado
    }

    // Inicializar OneSignal com o App ID
    console.log('Inicializando OneSignal...');
    OneSignal.initialize('85a27f07-2069-4cae-94ac-e85afa04d321');

    // Solicitar explicitamente permissão do OneSignal
    console.log('Solicitando permissões do OneSignal...');
    await OneSignal.Notifications.requestPermission(true);

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
    console.log('Processo de inicialização do OneSignal concluído. ID:', pushSubscriptionId);
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
  try {
    // Primeiro, tentar obter do AsyncStorage
    const storedPlayerId = await AsyncStorage.getItem('playerId');

    // Se não tiver no AsyncStorage, tentar obter diretamente do OneSignal
    if (!storedPlayerId) {
      console.log('PlayerId não encontrado no AsyncStorage, tentando obter do OneSignal...');
      const subscriptionId = await OneSignal.User.pushSubscription.getIdAsync();

      if (subscriptionId) {
        console.log('PlayerId obtido diretamente do OneSignal:', subscriptionId);
        await AsyncStorage.setItem('playerId', subscriptionId);
        return subscriptionId;
      } else {
        console.log('Não foi possível obter PlayerId do OneSignal');
        return null;
      }
    }

    console.log('PlayerId recuperado do AsyncStorage:', storedPlayerId);
    return storedPlayerId;
  } catch (error) {
    console.error('Erro ao obter playerId:', error);
    return null;
  }
}