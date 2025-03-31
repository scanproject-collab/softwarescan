import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateToken } from '@/src/app/utils/ValidateAuth';

export default function MyPerceptions() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const isValid = await validateToken();
        if (!isValid) return;

        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${API_URL}/posts/my-posts`, {
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
          throw new Error(data.message || 'Erro ao buscar posts');
        }

        setPosts(data.posts || []);
      } catch (error) {
        console.error('Erro ao buscar posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0 && mapRef.current) {
      const coordinates = posts
        .filter((post: any) => post.latitude && post.longitude && post.latitude !== 0 && post.longitude !== 0)
        .map((post: any) => ({
          latitude: post.latitude,
          longitude: post.longitude,
        }));

      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [posts]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const postsWithCoordinates = posts.filter(
    (post: any) => post.latitude && post.longitude && post.latitude !== 0 && post.longitude !== 0
  );

  if (postsWithCoordinates.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Minhas Percepções</Text>
        <Text style={styles.noCoordinatesText}>
          Nenhum post com localização disponível para exibir no mapa.
        </Text>
      </View>
    );
  }

  // Use the first valid post's coordinates as the initial region
  const initialRegion = {
    latitude: postsWithCoordinates[0].latitude,
    longitude: postsWithCoordinates[0].longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Percepções</Text>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
      >
        {postsWithCoordinates.map((post: any) => (
          <Marker
            key={post.id}
            coordinate={{
              latitude: post.latitude,
              longitude: post.longitude,
            }}
            title={post.title}
            description={post.content}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#092B6E',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  map: {
    width: '100%',
    height: 600,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  noCoordinatesText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
});