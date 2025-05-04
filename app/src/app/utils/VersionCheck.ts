import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

interface VersionInfo {
  version: string;
  required: boolean;
}

const STORAGE_KEYS = {
  LAST_VERSION_CHECK: 'lastVersionCheck',
  LATEST_VERSION: 'latestVersion'
};

/**
 * Check if a new version is available
 * @returns {Promise<VersionInfo|null>} Version information or null if no update available
 */
export const checkAppVersion = async (): Promise<VersionInfo | null> => {
  try {
    // Get current app version from app.config.js
    const currentVersion = Constants.expoConfig?.version || '0.0.0';

    // Check if we've already checked version recently (within 1 hour)
    const lastCheckStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_VERSION_CHECK);
    const cachedVersionStr = await AsyncStorage.getItem(STORAGE_KEYS.LATEST_VERSION);

    if (lastCheckStr && cachedVersionStr) {
      const lastCheck = parseInt(lastCheckStr);
      const currentTime = Date.now();

      // If cache is less than 1 hour old, use cached data
      if (currentTime - lastCheck < 60 * 60 * 1000) {
        const cachedVersion = JSON.parse(cachedVersionStr);

        // Only return data if there's a newer version
        if (isNewerVersion(currentVersion, cachedVersion.version)) {
          return cachedVersion;
        }
        return null;
      }
    }

    // Fetch latest version from API
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    const response = await fetch(`${API_URL}/auth/version`);

    if (!response.ok) {
      throw new Error('Failed to fetch version information');
    }

    const versionInfo: VersionInfo = await response.json();

    // Store the version info and timestamp
    await AsyncStorage.setItem(STORAGE_KEYS.LATEST_VERSION, JSON.stringify(versionInfo));
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_VERSION_CHECK, Date.now().toString());

    // Check if the latest version is newer than the current version
    if (isNewerVersion(currentVersion, versionInfo.version)) {
      return versionInfo;
    }

    return null;
  } catch (error) {
    console.error('Error checking app version:', error);
    return null;
  }
};

/**
 * Compare version strings to determine if available version is newer
 * @param {string} currentVersion Current installed version
 * @param {string} availableVersion Available version from API
 * @returns {boolean} True if available version is newer
 */
const isNewerVersion = (currentVersion: string, availableVersion: string): boolean => {
  const current = currentVersion.split('.').map(Number);
  const available = availableVersion.split('.').map(Number);

  for (let i = 0; i < Math.max(current.length, available.length); i++) {
    const currentPart = current[i] || 0;
    const availablePart = available[i] || 0;

    if (availablePart > currentPart) {
      return true;
    }

    if (availablePart < currentPart) {
      return false;
    }
  }

  return false;
}; 