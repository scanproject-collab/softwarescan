import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

const TOKEN_KEY = 'userToken';
const TOKEN_UPDATE_KEY = 'tokenLastUpdated';

export const validateToken = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      return false;
    }

    // Check if token was recently updated
    const wasUpdated = await wasTokenRecentlyUpdated();
    if (wasUpdated) {
      return true; // Skip full validation if token was recently updated
    }

    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    if (decoded.exp < currentTime) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(TOKEN_UPDATE_KEY);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(TOKEN_UPDATE_KEY);
    return false;
  }
};

export const updateToken = async (newToken: string): Promise<boolean> => {
  try {
    if (!newToken) {
      return false;
    }

    // Validate new token before storing
    const decoded: DecodedToken = jwtDecode(newToken);
    const currentTime = Math.floor(Date.now() / 1000);

    if (decoded.exp < currentTime) {
      return false;
    }

    // Store both the token and update timestamp
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    await AsyncStorage.setItem(TOKEN_UPDATE_KEY, Date.now().toString());
    
    return true;
  } catch (error) {
    console.error('Error updating token:', error);
    return false;
  }
};

export const wasTokenRecentlyUpdated = async (): Promise<boolean> => {
  try {
    const lastUpdateStr = await AsyncStorage.getItem(TOKEN_UPDATE_KEY);
    if (!lastUpdateStr) return false;

    const lastUpdate = parseInt(lastUpdateStr, 10);
    const currentTime = Date.now();
    
    // Consider "recent" as within the last 5 seconds
    return (currentTime - lastUpdate) <= 5000;
  } catch (error) {
    console.error('Error checking token update status:', error);
    return false;
  }
};
