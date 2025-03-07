
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import AppLogo from './components/appLogo';
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import Footer from './components/footer';
import RecoveryScreen from './components/auth/RecoveryScreen';

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <AppLogo />
          ),
          headerRight: () => (
            <Icon 
              name="person" 
              size={24} 
              color="#fff" 
              style={{ marginRight: 16 }}
        
            />
          ),
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ title: 'Scan' }} 
        />
        <Stack.Screen 
          name="pages/auth/index" 
          options={{ title: 'Login' }} 
        />
        <Stack.Screen 
          name="pages/interaction/[id]" 
          options={{ title: 'Local' }} 
        />
          <Stack.Screen 
          name="pages/auth/signup" 
          options={{ title: 'Registro' }} 
        />
          <Stack.Screen 
          name="pages/auth/recovery" 
          options={{ title: 'Recuperar Senha' }} 
        />
      </Stack>
      <Footer />
    </>
  );
}