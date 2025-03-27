import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
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
        if (!response.ok) {
          throw new Error(data.message || 'Erro ao buscar post');
        }

        if (data.post) {
          setPost(data.post);
        } else {
          setPost(null);
        }
      } catch (error) {
        setPost(null);
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

  const tags = Array.isArray(post.tags) ? post.tags : [];
  const hasValidCoordinates = typeof post.latitude === 'number' && typeof post.longitude === 'number' && post.latitude !== 0 && post.longitude !== 0;
  const imageUrl = typeof post.imageUrl === 'string' && post.imageUrl ? post.imageUrl : null;

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.imageContainer}>
        {imageUrl && (
          <>
            <Image source={{ uri: imageUrl }} style={styles.interactionImage} />
            <View style={styles.weightBadge}>
              <Text style={styles.weightText}>
                {post.weight} {post.weight === 1 ? 'ponto' : 'pontos'}
              </Text>
            </View>
          </>
        )}
      </View>
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
        <View style={styles.highlightSection}>
          <Text style={styles.highlightLabel}>Localização:</Text>
          <Text style={styles.highlightText}>{post.location || 'Não especificado'}</Text>
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
          Autor: {post.author && post.author.name ? post.author.name : 'Não disponível'}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
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
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  interactionImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#ddd',
  },
  weightBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#F56C2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  weightText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  detailsContainer: {
    padding: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
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
  highlightSection: {
    backgroundColor: '#f1f3f5',
    padding: 12, 
    borderRadius: 8,
    marginBottom: 16,
  },
  highlightLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F56C2E',
    marginBottom: 4,
  },
  highlightText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  detailText: {
    fontSize: 16,
    color: '#555',
    padding: 8, 
    marginBottom: 12,
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
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    marginBottom: 16,
  },
  mapLoading: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});