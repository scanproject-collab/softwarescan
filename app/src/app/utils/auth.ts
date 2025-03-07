import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

export const validateToken = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      await AsyncStorage.removeItem('userToken');
      router.replace('/pages/auth');
      return false;
    }

    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    if (decoded.exp < currentTime) {
      console.log('Token expirado');
      await AsyncStorage.removeItem('userToken');
      router.replace('/pages/auth');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    await AsyncStorage.removeItem('userToken');
    router.replace('/pages/auth');
    return false;
  }
};