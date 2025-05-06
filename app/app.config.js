import 'dotenv/config';
import { writeFileSync } from 'fs';

export default {
  expo: {
    name: 'Softwarescan',
    slug: 'softwarescan',
    version: '3.0.2',
    orientation: 'portrait',
    icon: './assets/images/scan-removebg-preview.png',
    scheme: 'softwarescan',
    userInterfaceStyle: 'automatic',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.anonymous.softwarescan',
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Este aplicativo precisa acessar a localização para mostrar sua posição no mapa.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Este aplicativo precisa acessar a localização para mostrar sua posição no mapa.",
        NSLocationAlwaysUsageDescription: "Este aplicativo precisa acessar a localização para mostrar sua posição no mapa.",
      }
    },
    android: {
      package: 'com.anonymous.softwarescan',
      versionCode: 16,
      permissions: [
        "NOTIFICATIONS",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "CAMERA",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "INTERNET",
        "FOREGROUND_SERVICE"
      ],
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY
        }
      },
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/scan-removebg-preview.png',
    },
    plugins: [
      'expo-router',
      [
        'onesignal-expo-plugin',
        {
          mode: 'development',
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/images/scan-removebg-preview.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: "Permitir que $(PRODUCT_NAME) use sua localização.",
          locationWhenInUsePermission: "Permitir que $(PRODUCT_NAME) use sua localização enquanto você está usando o aplicativo.",
          locationAlwaysPermission: "Permitir que $(PRODUCT_NAME) use sua localização em segundo plano.",
          isIosBackgroundLocationEnabled: true,
          isAndroidBackgroundLocationEnabled: true
        }
      ],
      'expo-asset',
    ],
    extra: {
      eas: {
        projectId: '12e5445b-4dda-4718-9e78-5834fb41db9f',
      },
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      googleApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
      oneSignalAppId: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID,
    },
    updates: {
      url: "https://u.expo.dev/12e5445b-4dda-4718-9e78-5834fb41db9f"
    },
    runtimeVersion: {
      policy: "sdkVersion"
    },
    experiments: {
      typedRoutes: true,
    },
    "owner": "softwarescaan"
  },
};

if (process.env.GOOGLE_SERVICES_JSON) {
  try {
    const jsonString = Buffer.from(process.env.GOOGLE_SERVICES_JSON, 'base64').toString('utf8');
    JSON.parse(jsonString); // Verifica se é um JSON válido
    writeFileSync('./google-services.json', jsonString, 'utf8');
  } catch (error) {
    console.error('Erro ao decodificar GOOGLE_SERVICES_JSON:', error);
  }
}