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
      permissions: ["NOTIFICATIONS", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"],
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
        projectId: '2ad9aa1c-f80d-4558-8a5a-d02752d160e3',
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
