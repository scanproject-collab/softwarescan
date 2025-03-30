import 'dotenv/config';

export default {
  expo: {
    name: 'Softwarescan',
    slug: 'softwarescan',
    version: '2.6.0',
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
      permissions: ['NOTIFICATIONS'],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/scan-removebg-preview.png',
    },
    plugins: [
      'expo-router',
      'expo-notifications',
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
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
      },
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      googleApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
    },
    experiments: {
      typedRoutes: true,
    },
    owner: 'softwarescan',
  },
};
