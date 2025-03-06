// pages/auth/registerScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image 
} from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      showToast('error', 'Erro de Cadastro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      showToast('error', 'Erro de Cadastro', 'As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/register`, {
        name,
        email,
        password,
      });

      showToast('success', 'Cadastro Bem-Sucedido', 'Sua conta foi criada e está aguardando aprovação!');
      setIsSuccess(true);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erro ao criar conta, tente novamente.';
      showToast('error', 'Erro de Cadastro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={styles.container}>
        <Toast />
        <Image source={require('@/assets/images/scan-removebg-preview.png')} style={styles.logo} />
        <Text style={styles.title}>Scan</Text>
        <Text style={styles.successMessage}>Sua conta foi criada e está aguardando aprovação do gestor para liberação de acesso.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/')}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Toast />
      <Image source={require('@/assets/images/scan-removebg-preview.png')} style={styles.logo} />
      <Text style={styles.title}>Criar conta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#9E9E9E"
        value={name}
        onChangeText={setName}
      />
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
        placeholder="Vínculo"
        placeholderTextColor="#9E9E9E"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#9E9E9E"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        placeholderTextColor="#9E9E9E"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Carregando...' : 'Criar conta'}
        </Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push('/pages/auth')}>
          <Text style={styles.link}>Já tem uma conta? Faça login</Text>
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
    justifyContent: 'center',
    width: '100%',
  },
  link: {
    color: '#F56C2E',
    fontSize: 16,
  },
  successMessage: {
    fontSize: 18,
    color: '#4CAF50',
    marginBottom: 30,
    textAlign: 'center',
  },
});

export default RegisterScreen;
