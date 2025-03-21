import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const showToast = (type: 'success' | 'error', text1: string, text2: string) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'bottom',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
    });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('error', 'Erro de Login', 'Por favor, preencha todos os campos.');
      return;
    }
  
    setIsLoading(true);
    try {
      console.log('URL usada:', `${process.env.EXPO_PUBLIC_API_URL}/auth/login`); 
      console.log('Dados enviados:', { email, password });
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const { token } = response.data;
      await AsyncStorage.setItem('userToken', token);
      console.log('Token armazenado:', token);
      showToast('success', 'Login Bem-Sucedido', 'Bem-vindo de volta!');
      router.replace('/');
      console.log('Redirecionamento chamado para /');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message === 'Account is pending approval'
          ? 'Sua conta ainda está aguardando aprovação do administrador.'
          : error?.response?.data?.message || 'Erro ao fazer login, verifique suas credenciais.';
      showToast('error', 'Erro de Login', errorMessage);
      console.error('Erro no login:', error.response ? error.response.data : error.message); // Depuração detalhada
    } finally {
      setIsLoading(false);
    }
  };

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
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#9E9E9E"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
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
        <TouchableOpacity onPress={() => router.push('/pages/auth/recovery')}>
          <Text style={styles.link}>Esqueceu a Senha?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/pages/auth/signup')}>
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

export default LoginScreen;