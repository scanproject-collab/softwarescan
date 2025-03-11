import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import debounce from 'lodash/debounce';

const PasswordRecoveryRequestScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = debounce(async () => {
    if (!email.includes('@')) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Digite um e-mail válido',
        position: 'top',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/password-recovery/request`, { email });
      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: `Um e-mail de recuperação foi enviado para ${email}`,
          position: 'top',
        });
        router.push({ pathname: '/components/auth/passwordRecoverySuccessScreen', params: { email } });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error.response?.data?.message || 'Erro ao enviar o e-mail de recuperação',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  }, 300);

  return (
      <View style={styles.container}>
        <Image source={require('../../../../assets/images/scan-removebg-preview.png')} style={styles.logo} />
        <Text style={styles.appName}>Scan</Text>
        <Text style={styles.instruction}>
          Para recuperar sua senha, digite abaixo seu email:
        </Text>
        <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#9E9E9E"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
        />
        <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8} style={styles.submitButton} disabled={loading}>
          <Text style={styles.submitButtonText}>{loading ? 'Enviando...' : 'Enviar email de recuperação'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={styles.backButton} disabled={loading}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Spinner visible={loading} textContent={'Carregando...'} textStyle={styles.spinnerText} />
        <Toast />
      </View>
  );
};

export default PasswordRecoveryRequestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F56C2E',
    marginBottom: 30,
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingLeft: 15,
    marginBottom: 15,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#F56C2E',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    width: '100%',
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  spinnerText: {
    color: '#fff',
  },
});