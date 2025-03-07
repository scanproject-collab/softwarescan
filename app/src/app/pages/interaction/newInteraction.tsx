import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import WebView from 'react-native-webview';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPlayerId } from '../../utils/oneSignal';

const mapHtml = (lat: number, lng: number, apiKey: string, setCoords: (lat: number, lng: number) => void) => `
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
          zoom: 14,
          pixelRatio: window.devicePixelRatio || 1
        });
        const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
        const ui = H.ui.UI.createDefault(map, defaultLayers);
        let marker = new H.map.Marker({ lat: ${lat}, lng: ${lng} });
        map.addObject(marker);

        map.addEventListener('tap', function(evt) {
          const coord = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);
          marker.setGeometry({ lat: coord.lat, lng: coord.lng });
          window.ReactNativeWebView.postMessage(JSON.stringify({ lat: coord.lat, lng: coord.lng }));
        });
      </script>
    </body>
  </html>
`;

export default function NewInteraction() {
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [coords, setCoords] = useState({ latitude: 0, longitude: 0 });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const HERE_API_KEY = process.env.EXPO_PUBLIC_API_KEY_MAP;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da localização para continuar.');
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      setCoords({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const playerId = await getPlayerId();
      if (!token) throw new Error('No token found');

      const formData = new FormData();
      formData.append('title', location || 'Interação sem título');
      formData.append('content', description);
      formData.append('tags', tags);
      formData.append('location', location);
      formData.append('latitude', coords.latitude.toString());
      formData.append('longitude', coords.longitude.toString());
      formData.append('playerId', playerId || '');
      if (image) {
        formData.append('image', {
          uri: image,
          name: 'image.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const response = await fetch('http://localhost:3000/posts/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        router.push('/');
      } else {
        Alert.alert('Erro', data.message || 'Falha ao criar interação.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um problema ao salvar a interação.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapTap = (event: any) => {
    const { lat, lng } = JSON.parse(event.nativeEvent.data);
    setCoords({ latitude: lat, longitude: lng });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova Interação</Text>

      <TextInput
        style={styles.input}
        placeholder="Local"
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Tags (separe por vírgula)"
        value={tags}
        onChangeText={setTags}
      />

      <Pressable onPress={pickImage} style={styles.imagePicker}>
        <Text style={styles.imagePickerText}>
          {image ? 'Alterar Imagem' : 'Selecionar Imagem'}
        </Text>
      </Pressable>
      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

      <View style={styles.mapContainer}>
        <Text style={styles.mapLabel}>Toque no mapa para selecionar a localização</Text>
        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml(coords.latitude, coords.longitude, HERE_API_KEY, setCoords) }}
          style={styles.map}
          onMessage={handleMapTap}
        />
      </View>

      <Pressable
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Salvando...' : 'Salvar Interação'}
        </Text>
      </Pressable>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Cancelar</Text>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  imagePicker: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
    alignSelf: 'center',
  },
  mapContainer: {
    marginBottom: 16,
  },
  mapLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#99ccff',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});