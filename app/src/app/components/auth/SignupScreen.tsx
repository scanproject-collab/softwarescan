import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { getPlayerId } from '../../utils/OneSignalNotification';
import { Picker } from '@react-native-picker/picker';

interface Institution {
  id: string;
  title: string;
  author: { name: string };
}

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [institutionId, setInstitutionId] = useState<string>('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  useEffect(() => {
    const fetchPushToken = async () => {
      const token = await getPlayerId();
      setPushToken(token);
    };
    fetchPushToken();
  }, []);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/institutions`);
        setInstitutions(response.data.institutions);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível carregar as instituições.',
        });
      }
    };
    fetchInstitutions();
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', text1: string, text2: string) => {
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

  const handleSendVerificationCode = async () => {
    if (!email) {
      showToast('error', 'Erro', 'Por favor, insira um email válido.');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/send-verification-code`, { email });
      setIsVerificationSent(true);
      showToast('info', 'Código Enviado', 'Um código de verificação foi enviado para o seu email.');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erro ao enviar código de verificação.';
      showToast('error', 'Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !verificationCode) {
      showToast('error', 'Erro de Cadastro', 'Por favor, preencha todos os campos, incluindo o código de verificação.');
      return;
    }

    if (password !== confirmPassword) {
      showToast('error', 'Erro de Cadastro', 'As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Push Token antes de enviar:', pushToken);
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/register`, {
        name,
        email,
        password,
        playerId: pushToken,
        institutionId: institutionId || undefined,
        verificationCode,
      });

      showToast(
        'info',
        'Cadastro Enviado',
        'Sua conta está pendente de aprovação. Você receberá uma notificação quando for aprovada!'
      );
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
        <Text style={styles.successMessage}>
          Sua conta foi enviada com sucesso e está aguardando aprovação do administrador. Você será notificado quando sua conta for liberada.
        </Text>
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
      {!isVerificationSent ? (
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSendVerificationCode}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Enviando...' : 'Enviar Código de Verificação'}
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Código de Verificação"
            placeholderTextColor="#9E9E9E"
            value={verificationCode}
            onChangeText={setVerificationCode}
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
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Vínculo</Text>
            <Picker
              selectedValue={institutionId}
              onValueChange={(itemValue) => setInstitutionId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecione uma instituição" value="" />
              {institutions.map((institution) => (
                <Picker.Item
                  key={institution.id}
                  label={`${institution.title} (Criado por: ${institution.author.name || 'Desconhecido'})`}
                  value={institution.id}
                />
              ))}
            </Picker>
          </View>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Carregando...' : 'Criar conta'}
            </Text>
          </TouchableOpacity>
        </>
      )}
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
  pickerContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  picker: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
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