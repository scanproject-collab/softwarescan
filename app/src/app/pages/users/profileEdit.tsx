import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';

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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [institutionTitle, setInstitutionTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        try {
          const decoded = jwt_decode<DecodedToken>(token);
          setUser(decoded);
          setName(decoded.name || '');
          setEmail(decoded.email || '');
          setInstitutionTitle(decoded.institution?.title || 'Nenhuma instituição');
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    if (!name || !email || !email.includes('@')) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Nome e e-mail válido são obrigatórios',
        position: 'top',
      });
      return;
    }

    if (newPassword && newPassword !== confirmNewPassword) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'As senhas não coincidem',
        position: 'top',
      });
      return;
    }

    if (newPassword && !currentPassword) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'A senha atual é obrigatória para alterar a senha',
        position: 'top',
      });
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/operator/update`,
        {
          name,
          email,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        // Atualiza o token com o novo retornado
        if (response.data.token) {
          await AsyncStorage.setItem('userToken', response.data.token);
        }

        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Perfil atualizado com sucesso!',
          position: 'top',
        });
        router.push('/pages/users/profile');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error.response?.data?.message || 'Erro ao atualizar o perfil',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
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
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
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