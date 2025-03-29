import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

export const validateToken = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      await AsyncStorage.removeItem('userToken');
      return false;
    }

    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    if (decoded.exp < currentTime) {
      await AsyncStorage.removeItem('userToken');
      return false;
    }

    return true;
  } catch (error) {
    await AsyncStorage.removeItem('userToken');
    return false;
  }
};
