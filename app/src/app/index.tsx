// pages/index.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  const navigateToLogin = () => {
    router.push('/components/loginScreen'); 
  };

  return (
    <View>
      <Text>Home Page</Text>
      <Button title="Ir para Login" onPress={navigateToLogin} />
    </View>
  );
}
