import React, { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, FlatList, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InteractionCard from './components/cardInteraction';
import { validateToken } from './utils/auth';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const isValid = await validateToken();
        if (!isValid) return;

        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${API_URL}/posts/my-posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });

        if (response.status === 401) {
          console.log('Token inválido ou expirado, redirecionando para login');
          await AsyncStorage.removeItem('userToken');
          router.replace('/pages/auth');
          return;
        }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Erro ao buscar posts');
        }

        console.log('Posts recebidos:', data);
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Erro ao buscar posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Você ainda não possui nenhuma postagem. Crie uma nova interação!
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <InteractionCard
              location={item.location || 'Local não especificado'}
              imageUrl={item.imageUrl}
              hasImage={!!item.imageUrl}
              tags={item.tags || []}
              onPress={() => router.push(`/pages/users/interaction/${item.id}`)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Pressable
        style={styles.addButton}
        onPress={() => router.push('/pages/users/interaction/newInteraction')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/pages/auth/recovery')}
      >
      <Text style={styles.addButtonText}>oiiiiiiiii</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});