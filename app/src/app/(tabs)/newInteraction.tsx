import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Image, Alert, ScrollView, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPlayerId } from '../../../utils/oneSignal';
import { validateToken } from '../../../utils/auth';
import { Calendar } from 'react-native-calendars';
import MapView, { Marker } from 'react-native-maps';
import { geocodeAddress, reverseGeocode } from '../../../utils/googleMaps';

export default function NewInteraction() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState({ latitude: 0, longitude: 0 });
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const initialize = async () => {
      const isValid = await validateToken();
      if (!isValid) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'A permissão de localização não foi concedida, mas você pode continuar sem ela.');
        setMapLoaded(true);
        return;
      }

      try {
        const locationData = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCoords({
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
        });
        setMapLoaded(true);

        try {
          const address = await reverseGeocode(locationData.coords.latitude, locationData.coords.longitude);
          setLocation(address);
        } catch (geoError) {
          console.warn('Erro ao obter endereço inicial:', geoError);
          setLocation('Localização não disponível');
        }
      } catch (error) {
        console.error('Erro ao obter localização:', error);
        setMapLoaded(true);
        setLocation('Localização não disponível');
      }
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

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const newTags = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      setTags(prevTags => [...prevTags, ...newTags]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddressChange = async (text: string) => {
    setLocation(text);
    if (text.trim() === '') return;
    try {
      const response = await geocodeAddress(text);
      setCoords(response);
    } catch (error) {
      Alert.alert('Erro', 'Endereço não encontrado. Tente outro endereço ou selecione no mapa.');
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setCoords({ latitude, longitude });

    try {
      const address = await reverseGeocode(latitude, longitude);
      setLocation(address);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter o endereço para essa localização.');
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
      formData.append('title', title || 'Interação sem título');
      formData.append('content', description || '');
      formData.append('tags', tags.join(','));
      if (image) {
        formData.append('image', {
          uri: image,
          name: 'image.jpg',
          type: 'image/jpeg',
        } as any);
      }
      formData.append('playerId', playerId || '');

      // Adicionar localização apenas se houver coordenadas válidas
      if (coords.latitude !== 0 && coords.longitude !== 0 && location.trim()) {
        formData.append('location', location);
        formData.append('latitude', coords.latitude.toString());
        formData.append('longitude', coords.longitude.toString());
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

  return (
      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>Título</Text>
        <TextInput
            style={styles.input}
            placeholder="Digite o título da interação"
            value={title}
            onChangeText={setTitle}
        />

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

        <Text style={styles.sectionTitle}>Tags</Text>
        <View style={styles.tagInputContainer}>
          <TextInput
              style={[styles.input, styles.tagInput]}
              placeholder="Digite as tags (separadas por vírgula)"
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={handleAddTag}
          />
          <Pressable onPress={handleAddTag} style={styles.addTagButton}>
            <Text style={styles.addTagButtonText}>Adicionar</Text>
          </Pressable>
        </View>
        {tags.length > 0 && (
            <FlatList
                data={tags}
                horizontal
                renderItem={({ item }) => (
                    <View style={styles.tagChip}>
                      <Text style={styles.tagText}>{item}</Text>
                      <Pressable onPress={() => handleRemoveTag(item)}>
                        <Text style={styles.removeTagText}>x</Text>
                      </Pressable>
                    </View>
                )}
                keyExtractor={(item) => item}
                style={styles.tagList}
            />
        )}

        <Text style={styles.sectionTitle}>Local (Opcional)</Text>
        <TextInput
            style={styles.input}
            placeholder="Digite um endereço (ex.: Rua Exemplo, Cidade) ou selecione no mapa"
            value={location}
            onChangeText={handleAddressChange}
        />
        {mapLoaded && coords.latitude !== 0 && coords.longitude !== 0 ? (
            <MapView
                style={styles.map}
                region={{
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}
            >
              <Marker coordinate={{ latitude: coords.latitude, longitude: coords.longitude }} />
            </MapView>
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
    width: '100%',
    height: 300,
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
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
  addTagButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tagList: {
    marginBottom: 12,
  },
  tagChip: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  tagText: {
    color: '#333',
    fontSize: 14,
  },
  removeTagText: {
    color: '#ff3b30',
    marginLeft: 6,
    fontSize: 16,
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