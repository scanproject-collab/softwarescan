import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateToken } from '../../../utils/auth';

const mapHtml = (lat: number, lng: number, apiKey: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="initial-scale=1.0, width=device-width">
      <script src="https://js.api.here.com/v3/3.1/mapsjs-core.js"></script>
      <script src="https://js.api.here.com/v3/3.1/mapsjs-service.js"></script>
      <script src="https://js.api.here.com/v3/3.1/mapsjs-ui.js"></script>
      <script src="https://js.api.here.com/v3/3.1/mapsjs-mapevents.js"></script>
      <link rel="stylesheet" href="https://js.api.here.com/v3/3.1/mapsjs-ui.css" />
      <style>
        html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
      </style>
    </head>
    <body>
      <div id="map" style="width: 100%; height: 100%;"></div>
      <script>
        const platform = new H.service.Platform({ 'apikey': '${apiKey}' });
        const defaultLayers = platform.createDefaultLayers();
        const map = new H.Map(document.getElementById('map'),
          defaultLayers.vector.normal.map, {
          center: { lat: ${lat}, lng: ${lng} },
          zoom: 15,
          pixelRatio: window.devicePixelRatio || 1
        });
        const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
        const ui = H.ui.UI.createDefault(map, defaultLayers);
        const marker = new H.map.Marker({ lat: ${lat}, lng: ${lng} });
        map.addObject(marker);
      </script>
    </body>
  </html>
`;

export default function InteractionDetail() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const HERE_API_KEY = process.env.EXPO_PUBLIC_API_KEY_MAP;
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

        if (data.post) setPost(data.post);
      } catch (error) {
        console.error('Erro ao buscar post:', error);
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

  return (
      <View style={styles.container}>
        {post.imageUrl && (
            <Image source={{ uri: post.imageUrl }} style={styles.interactionImage} />
        )}
        <View style={styles.detailsContainer}>
          <View style={styles.tagsContainer}>
            {(post.tags || []).map((tag, index) => (
                <Text key={index} style={styles.tagText}>{tag}</Text>
            ))}
          </View>
          <Text style={styles.detailText}>
            Data: {new Date(post.createdAt).toLocaleDateString('pt-BR')}
          </Text>
          <Text style={styles.detailText}>
            Hora: {new Date(post.createdAt).toLocaleTimeString('pt-BR')}
          </Text>
          <Text style={styles.detailText}>Observações: {post.content || 'Sem descrição'}</Text>
          <Text style={styles.detailText}>Local: {post.location || 'Não especificado'}</Text>
        </View>
        {post.latitude && post.longitude && (
            <WebView
                originWhitelist={['*']}
                source={{ html: mapHtml(post.latitude, post.longitude, HERE_API_KEY) }}
                style={styles.map}
            />
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
    height: 300, // Aumentado para melhor visualização
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
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