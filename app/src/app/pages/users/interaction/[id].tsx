import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateToken } from '../../../utils/auth';

export default function InteractionDetail() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const isValid = await validateToken();
        if (!isValid) return;

        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${API_URL}/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          console.log('Token inválido ou expirado, redirecionando para login');
          await AsyncStorage.removeItem('userToken');
          router.replace('/pages/auth');
          return;
        }

        const data = await response.json();
        console.log('Dados recebidos da API:', data); // Para depuração
        if (!response.ok) {
          throw new Error(data.message || 'Erro ao buscar post');
        }

        if (data.post) {
          setPost(data.post);
        } else {
          setPost(null); // Garante que post seja null se não houver dados válidos
        }
      } catch (error) {
        console.error('Erro ao buscar post:', error);
        setPost(null); // Em caso de erro, define como null para exibir mensagem
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Post não encontrado.</Text>
      </View>
    );
  }

  // Validações para garantir que os dados sejam tratados corretamente
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const hasValidCoordinates = typeof post.latitude === 'number' && typeof post.longitude === 'number' && post.latitude !== 0 && post.longitude !== 0;
  const imageUrl = typeof post.imageUrl === 'string' && post.imageUrl ? post.imageUrl : null;

  return (
    <View style={styles.container}>
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.interactionImage} />
      )}
      <View style={styles.detailsContainer}>
        <Text style={styles.titleText}>{post.title || 'Sem Título'}</Text>
        <View style={styles.tagsContainer}>
          {tags.length > 0 ? (
            tags.map((tag, index) => (
              <Text key={index} style={styles.tagText}>{String(tag)}</Text>
            ))
          ) : (
            <Text style={styles.tagText}>Sem tags</Text>
          )}
        </View>
        <Text style={styles.detailText}>
          Data: {post.createdAt ? new Date(post.createdAt).toLocaleDateString('pt-BR') : 'Data indisponível'}
        </Text>
        <Text style={styles.detailText}>
          Hora: {post.createdAt ? new Date(post.createdAt).toLocaleTimeString('pt-BR') : 'Hora indisponível'}
        </Text>
        <Text style={styles.detailText}>
          Observações: {post.content || 'Sem descrição'}
        </Text>
        <Text style={styles.detailText}>
          Local: {post.location || 'Não especificado'}
        </Text>
      </View>
      {hasValidCoordinates ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: post.latitude,
            longitude: post.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker coordinate={{ latitude: post.latitude, longitude: post.longitude }} />
        </MapView>
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapLoading}>Localização não disponível.</Text>
        </View>
      )}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
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
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  interactionImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#ddd',
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tagText: {
    fontSize: 14,
    color: '#007AFF',
    backgroundColor: '#e6f9ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    lineHeight: 22,
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mapPlaceholder: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapLoading: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  backButton: {
    padding: 14,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
    width: '40%',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});