import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import WebView from 'react-native-webview';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPlayerId } from '../../../utils/oneSignal';
import { validateToken } from '../../../utils/auth';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { geocodeAddress } from '../../../utils/hereMaps';

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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const router = useRouter();
  const HERE_API_KEY = process.env.EXPO_PUBLIC_API_KEY_MAP;
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const initialize = async () => {
      const isValid = await validateToken();
      if (!isValid) return;

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
      setMapLoaded(true);
    };

    initialize();
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

  const handleAddressChange = async (text: string) => {
    setLocation(text);
    try {
      const coords = await geocodeAddress(text);
      setCoords(coords);
    } catch (error) {
      Alert.alert('Erro', 'Endereço não encontrado. Use o mapa para selecionar uma localização.');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const isValid = await validateToken();
      if (!isValid) return;

      const token = await AsyncStorage.getItem('userToken');
      const playerId = await getPlayerId();

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

      const response = await fetch(`${API_URL}/posts/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        console.log('Token inválido ou expirado, redirecionando para login');
        await AsyncStorage.removeItem('userToken');
        router.replace('/pages/auth');
        return;
      }

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
      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>Data</Text>
        <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{ [selectedDate]: { selected: true, disableTouchEvent: true, selectedColor: '#007AFF' } }}
            style={styles.calendar}
        />
        <Text style={styles.hint}>* Selecione a data em que a foto foi tirada (pode ser diferente do dia atual).</Text>

        <Text style={styles.sectionTitle}>Hora</Text>
        <TextInput
            style={styles.input}
            placeholder="hh:mm (ex.: 14:30)"
            value={selectedTime}
            onChangeText={setSelectedTime}
        />
        <Text style={styles.hint}>* Insira a hora em que a foto foi tirada (pode diferir do horário atual).</Text>

        <Text style={styles.sectionTitle}>Observações</Text>
        <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Campo de texto longo"
            value={description}
            onChangeText={setDescription}
            multiline
        />

        <Text style={styles.sectionTitle}>Local</Text>
        <TextInput
            style={styles.input}
            placeholder="Digite um endereço (ex.: Rua Exemplo, Cidade)"
            value={location}
            onChangeText={handleAddressChange}
        />
        {mapLoaded && coords.latitude !== 0 && coords.longitude !== 0 ? (
            <WebView
                originWhitelist={['*']}
                source={{ html: mapHtml(coords.latitude, coords.longitude, HERE_API_KEY) }}
                style={styles.map}
                onMessage={handleMapTap}
            />
        ) : (
            <Text style={styles.mapLoading}>Carregando mapa...</Text>
        )}

        <Pressable onPress={pickImage} style={styles.imagePicker}>
          <Text style={styles.imagePickerText}>
            {image ? 'Alterar Imagem' : 'Selecionar Imagem'}
          </Text>
        </Pressable>
        {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

        <View style={styles.buttonContainer}>
          <Pressable
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Text>
          </Pressable>

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Cancelar</Text>
          </Pressable>
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  map: {
    width: '100',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mapLoading: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  imagePicker: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
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
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    flex: 1,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
});