import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { OneSignal } from 'react-native-onesignal';

// Helper to safely execute a function and catch any errors
const safeExecute = async <T>(fn: () => Promise<T>, errorMsg: string): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    console.error(errorMsg, error);
    return null;
  }
};

async function initializeExpoNotifications() {
  return await safeExecute(async () => {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }, 'Erro ao configurar notificações do Expo:');
}

export async function initializeOneSignalNotification() {
  return await safeExecute(async () => {
    // Try to initialize Expo notifications
    const permissionsGranted = await initializeExpoNotifications();
    if (!permissionsGranted) {
      console.warn('Permissões de notificação não concedidas');
      return null;
    }

    // Small delay to ensure everything is ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Configure OneSignal with error handling
    try {
      OneSignal.Debug.setLogLevel(OneSignal.LOG_LEVEL.VERBOSE);
      
      // Initialize with app ID
      OneSignal.initialize('85a27f07-2069-4cae-94ac-e85afa04d321', {
        kOSSettingsKeyAutoPrompt: false
      });
    } catch (error) {
      console.error('Erro ao inicializar OneSignal:', error);
      return null;
    }

    // Set up subscription monitoring with error handling
    let subscription;
    try {
      subscription = OneSignal.User.pushSubscription.addEventListener('change', async (sub) => {
        try {
          if (sub?.id) {
            console.log('ID de Subscription atualizado:', sub.id);
            await AsyncStorage.setItem('playerId', sub.id);
          }
        } catch (error) {
          console.error('Erro ao salvar subscription ID:', error);
        }
      });
    } catch (error) {
      console.error('Erro ao adicionar event listener ao OneSignal:', error);
    }

    // Try to get the current subscription ID
    const getCurrentId = async () => {
      try {
        const pushSubscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
        if (pushSubscriptionId) {
          console.log('ID de Subscription atual:', pushSubscriptionId);
          await AsyncStorage.setItem('playerId', pushSubscriptionId);
          return pushSubscriptionId;
        }
        return null;
      } catch (error) {
        console.error('Erro ao obter subscription ID:', error);
        return null;
      }
    };

    // Return object with cleanup function and player ID
    return {
      cleanup: () => {
        try {
          if (subscription) {
            subscription.remove();
          }
        } catch (error) {
          console.error('Erro ao remover listener do OneSignal:', error);
        }
      },
      playerId: await getCurrentId()
    };
  }, 'Erro crítico na inicialização do OneSignal:');
}

export async function getPlayerId() {
  return await safeExecute(async () => {
    const playerId = await AsyncStorage.getItem('playerId');
    if (!playerId) {
      console.warn('PlayerID não encontrado no AsyncStorage');
      return null;
    }
    return playerId;
  }, 'Erro ao recuperar PlayerID:');
}

export async function cleanupOneSignal() {
  await safeExecute(async () => {
    try {
      OneSignal.Notifications.clearAll();
    } catch (error) {
      console.error('Erro ao limpar notificações do OneSignal:', error);
    }
    
    try {
      OneSignal.User.pushSubscription.removeAllListeners();
    } catch (error) {
      console.error('Erro ao remover listeners do OneSignal:', error);
    }
  }, 'Erro ao limpar OneSignal:');
}