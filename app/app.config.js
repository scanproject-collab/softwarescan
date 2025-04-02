import 'dotenv/config';

export default {
  expo: {
    name: 'Softwarescan',
    slug: 'softwarescan',
    version: '2.6.3',
    orientation: 'portrait',
    icon: './assets/images/scan-removebg-preview.png',
    scheme: 'softwarescan',
    userInterfaceStyle: 'automatic',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.anonymous.softwarescan',
    },
    android: {
      package: 'com.anonymous.softwarescan',
      permissions: ["NOTIFICATIONS", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE", "CAMERA", "ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION", "INTERNET", "FOREGROUND_SERVICE"],
      googleServicesFile: './google-services.json',
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
    experiments: {
      typedRoutes: true,
    },
    owner: 'softwarescan',
  },
};
