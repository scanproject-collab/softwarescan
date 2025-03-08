import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateToken } from '../../../utils/auth';

const mapHtml = (posts: any[], apiKey: string) => `
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
          center: { lat: 0, lng: 0 },
          zoom: 2,
          pixelRatio: window.devicePixelRatio || 1
        });
        const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
        const ui = H.ui.UI.createDefault(map, defaultLayers);

        const posts = ${JSON.stringify(posts)};
        posts.forEach(post => {
          if (post.latitude && post.longitude) {
            const marker = new H.map.Marker({ lat: post.latitude, lng: post.longitude });
            map.addObject(marker);
          }
        });

        // Ajustar o mapa para incluir todos os marcadores
        const group = new H.map.Group();
        posts.forEach(post => {
          if (post.latitude && post.longitude) {
            group.addObject(new H.map.Marker({ lat: post.latitude, lng: post.longitude }));
          }
        });
        map.addObject(group);
        map.getViewModel().setLookAtData({ bounds: group.getBoundingBox() });
      </script>
    </body>
  </html>
`;

export default function MinhasPercepcoes() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const HERE_API_KEY = process.env.EXPO_PUBLIC_API_KEY_MAP;
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Minhas Percepções</Text>
            <WebView
                originWhitelist={['*']}
                source={{ html: mapHtml(posts, HERE_API_KEY) }}
                style={styles.map}
            />
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
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007AFF',
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
        height: 600, // Mapa completo
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