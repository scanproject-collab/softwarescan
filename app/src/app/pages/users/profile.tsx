import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';

interface DecodedToken {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  institutionId?: string;
  createdAt?: string;
}

const ProfileScreen = () => {
  const [user, setUser] = useState<DecodedToken | null>(null);

  const fetchUserData = useCallback(async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      try {
        const decoded = jwt_decode<DecodedToken>(token);
        setUser(decoded);
      } catch (error) {
        console.error('Error decoding token:', error);
        setUser(null);
      }
    }
  }, []);

  // Atualiza os dados do usuário sempre que a tela for focada
  useFocusEffect(
      useCallback(() => {
        fetchUserData();
      }, [fetchUserData])
  );

  if (!user) {
    return (
        <View style={styles.container}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
    );
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';
  const institution = user.institutionId ? 'Instituição Vinculada' : 'Nenhuma instituição';
  const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Data não disponível';

  return (
      <View style={styles.container}>
        <View style={styles.profileHeader}>
          <View style={styles.userCircle}>
            <Text style={styles.userInitial}>{initial}</Text>
          </View>
          <Text style={styles.name}>{user.name || 'Usuário'}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email || 'Não informado'}</Text>
          <Text style={styles.label}>Instituição:</Text>
          <Text style={styles.value}>{institution}</Text>
          <Text style={styles.label}>Data de Criação:</Text>
          <Text style={styles.value}>{createdAt}</Text>
        </View>
        <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push({ pathname: '/pages/users/profileEdit', params: { id: user.id } })}
        >
          <Text style={styles.editButtonText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInitial: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
});

export default ProfileScreen;