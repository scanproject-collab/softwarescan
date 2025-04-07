import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';
import { updateToken } from '@/src/app/utils/ValidateAuth';

interface DecodedToken {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  institutionId?: string;
  createdAt?: string;
  institution?: { title: string };
}

const EditProfileScreen = () => {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [institutionTitle, setInstitutionTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Email verification states
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        try {
          const decoded = jwt_decode<DecodedToken>(token);
          setUser(decoded);
          setName(decoded.name || '');
          setEmail(decoded.email || '');
          setOriginalEmail(decoded.email || '');
          setInstitutionTitle(decoded.institution?.title || 'Nenhuma instituição');
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    };
    fetchUserData();
  }, []);

  // Show toast utility function
  const showToast = (type: 'success' | 'error' | 'info', text1: string, text2: string) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
    });
  };

  // Handle email verification code sending
  const handleSendVerificationCode = async () => {
    if (!email || !email.includes('@')) {
      showToast('error', 'Erro', 'Por favor, insira um email válido.');
      return;
    }

    setLoading(true);
    try {
      console.log(`Enviando solicitação de código para: ${email}`);
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/send-verification-code`, { email });
      console.log('Resposta do envio de código:', response.data);
      setIsVerificationSent(true);
      setShowVerificationInput(true);
      showToast('info', 'Código Enviado', 'Um código de verificação foi enviado para o seu email.');
    } catch (error: any) {
      console.error('Erro ao enviar código de verificação:', error?.response?.data || error.message);
      const errorMessage = error?.response?.data?.message || 'Erro ao enviar código de verificação.';
      showToast('error', 'Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle name update only
  const handleNameUpdate = async () => {
    if (!name) {
      showToast('error', 'Erro', 'Nome é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/operator/update`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.status === 200) {
        // Update token with the new one
        if (response.data.token) {
          const updated = await updateToken(response.data.token);
          if (!updated) {
            throw new Error('Falha ao atualizar o token');
          }
        }

        showToast('success', 'Sucesso', 'Nome atualizado com sucesso!');
        router.push('/pages/users/ProfileUser');
      }
    } catch (error: any) {
      showToast('error', 'Erro', error.response?.data?.message || 'Erro ao atualizar o nome');
    } finally {
      setLoading(false);
    }
  };

  // Handle email update with verification
  const handleEmailUpdate = async () => {
    if (!email || !email.includes('@')) {
      showToast('error', 'Erro', 'E-mail válido é obrigatório');
      return;
    }

    if (email === originalEmail) {
      showToast('info', 'Informação', 'O e-mail não foi alterado');
      return;
    }

    if (!isVerificationSent) {
      // First step: send verification code
      setIsEmailChanged(true);
      handleSendVerificationCode();
      return;
    }

    if (!verificationCode) {
      showToast('error', 'Erro', 'Código de verificação é obrigatório');
      return;
    }
    
    // Second step: verify code and update email
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // Log request details for debugging
      console.log('Enviando verificação para atualização de email:');
      console.log('- Email:', email);
      console.log('- Código de verificação:', verificationCode);
      
      const updateData = { 
        email: email.trim(),
        verificationCode: verificationCode.trim()
      };
      
      console.log('Dados da requisição:', updateData);
      
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/operator/update`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Resposta da atualização de email:', response.data);
      
      if (response.status === 200) {
        // Update token with the new one
        if (response.data.token) {
          console.log('Atualizando token com novo email');
          const updated = await updateToken(response.data.token);
          if (!updated) {
            throw new Error('Falha ao atualizar o token');
          }
        }
        
        showToast('success', 'Sucesso', 'E-mail atualizado com sucesso!');
        setIsVerificationSent(false);
        setShowVerificationInput(false);
        setVerificationCode('');
        setIsEmailChanged(false);
        setOriginalEmail(email);
        router.push('/pages/users/ProfileUser');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar email:', error);
      console.error('Detalhes da resposta:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar o e-mail';
      showToast('error', 'Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle password update with confirmation
  const handlePasswordUpdate = async () => {
    if (!currentPassword) {
      showToast('error', 'Erro', 'A senha atual é obrigatória para alterar a senha');
      return;
    }

    if (!newPassword) {
      showToast('error', 'Erro', 'A nova senha é obrigatória');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast('error', 'Erro', 'As senhas não coincidem');
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      "Aviso de Logout",
      "Alterar a senha irá desconectar você do aplicativo. Deseja continuar?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Continuar", 
          onPress: async () => {
            // Proceed with password update
            setLoading(true);
            try {
              const token = await AsyncStorage.getItem('userToken');
              const response = await axios.put(
                `${process.env.EXPO_PUBLIC_API_URL}/operator/update`,
                {
                  currentPassword,
                  newPassword
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (response.status === 200) {
                // For password changes, we still want to force a logout
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('tokenLastUpdated');
                
                showToast('success', 'Sucesso', 'Senha atualizada com sucesso! Você será redirecionado para o login.');
                
                // Redirect to login after a brief delay
                setTimeout(() => {
                  router.replace('/pages/auth');
                }, 1500);
              }
            } catch (error: any) {
              showToast('error', 'Erro', error.response?.data?.message || 'Erro ao atualizar a senha');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Main update handler that delegates to specific update functions
  const handleUpdate = () => {
    // Check if email is being updated
    if (email !== originalEmail) {
      handleEmailUpdate();
      return;
    }
    
    // Check if password is being updated
    if (newPassword) {
      handlePasswordUpdate();
      return;
    }
    
    // If only name is being updated
    handleNameUpdate();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (text !== originalEmail) {
            setIsEmailChanged(true);
          } else {
            setIsEmailChanged(false);
            setIsVerificationSent(false);
            setShowVerificationInput(false);
          }
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      {isEmailChanged && !isVerificationSent && (
        <TouchableOpacity 
          style={[styles.submitButton, { marginBottom: 15 }]} 
          onPress={handleSendVerificationCode}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Enviando...' : 'Enviar Código de Verificação'}
          </Text>
        </TouchableOpacity>
      )}
      
      {showVerificationInput && (
        <TextInput
          style={styles.input}
          placeholder="Código de Verificação (letras e números)"
          value={verificationCode}
          onChangeText={(text) => {
            // Allow only alphanumeric characters but maintain original case
            const alphanumericText = text.replace(/[^a-zA-Z0-9]/g, '');
            setVerificationCode(alphanumericText);
          }}
          autoCapitalize="none"
          maxLength={6}
          keyboardType="visible-password"
        />
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Senha atual (obrigatória para alterar a senha)"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Nova senha (opcional)"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      {newPassword ? (
        <TextInput
          style={styles.input}
          placeholder="Confirmar nova senha"
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          secureTextEntry
        />
      ) : null}
      <Text style={styles.label}>Instituição:</Text>
      <Text style={styles.value}>{institutionTitle}</Text>
      <TouchableOpacity onPress={handleUpdate} activeOpacity={0.8} style={styles.submitButton} disabled={loading}>
        <Text style={styles.submitButtonText}>{loading ? 'Salvando...' : 'Salvar Alterações'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={styles.backButton} disabled={loading}>
        <Text style={styles.backButtonText}>Cancelar</Text>
      </TouchableOpacity>
      <Spinner visible={loading} textContent={'Carregando...'} textStyle={styles.spinnerText} />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F56C2E',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    alignSelf: 'flex-start',
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
    marginTop: 10,
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

export default EditProfileScreen;