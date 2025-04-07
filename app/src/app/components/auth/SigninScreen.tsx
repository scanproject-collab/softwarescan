import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const showToast = useCallback((type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top', 
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
    });
  }, []);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      showToast('error', 'Erro de Login', 'Por favor, preencha todos os campos.');
      return;
    }
  
    setIsLoading(true);
    try {
      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/auth/login`;
      console.log('API URL being used:', apiUrl); 
      console.log('Request payload:', { email, password }); 
  
      const response = await axios.post(apiUrl, { email, password }, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      const { token } = response.data;
      try {
        await AsyncStorage.setItem('userToken', token);
        console.log('Token saved to AsyncStorage:', token); 
      } catch (storageError) {
        console.error('Failed to save token to AsyncStorage:', storageError);
      }
  
      showToast('success', 'Login Bem-Sucedido', 'Bem-vindo de volta!');
      router.replace('/');
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message === 'Account is pending approval'
          ? 'Sua conta ainda está aguardando aprovação do administrador.'
          : error?.response?.data?.message || 'Erro ao fazer login, verifique suas credenciais.';
      showToast('error', 'Erro de Login', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, showToast]);

  return (
    <View style={styles.container}>
      <Toast />
      <Image source={require('@/assets/images/scan-removebg-preview.png')} style={styles.logo} />
      <Text style={styles.title}>Scan</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#9E9E9E"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#9E9E9E"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCorrect={false}
      />
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Carregando...' : 'Login'}
        </Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push('/pages/auth/Recovery')}>
          <Text style={styles.link}>Esqueceu a Senha?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/pages/auth/SignUp')}>
          <Text style={styles.link}>Criar Conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F56C2E',
    marginBottom: 30,
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
  button: {
    width: '100%',
    backgroundColor: '#F56C2E',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#F56C2E88',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  link: {
    color: '#F56C2E',
    fontSize: 16,
  },
});

export default React.memo(LoginScreen);