import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { reverseGeocode, geocodeAddress, getPlaceSuggestions } from '@/src/app/utils/GoogleMaps';
import * as Location from 'expo-location';
import MapViewComponent from '@/src/app/components/posts/MapViewComponent';
import LocationPicker from '@/src/app/components/posts/LocationPicker';
import NetInfo from "@react-native-community/netinfo";

interface Tag {
  name: string;
  weight: string | null;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function EditPost() {
  const router = useRouter();
  const { postId } = useLocalSearchParams();

  // Estados do formulário
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isManualLocation, setIsManualLocation] = useState(false);

  // Verificar conectividade
  useEffect(() => {
    const checkConnectivity = async () => {
      const netInfo = await NetInfo.fetch();
      setIsOffline(!netInfo.isConnected);
    };

    checkConnectivity();

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // Carregar dados da postagem ao abrir
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await fetch(`${API_URL}/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro ao buscar postagem');
        const post = data.post;
        setTitle(post.title || '');
        setDescription(post.content || '');
        setSelectedTags(post.tags || []);
        setImage(post.imageUrl || null);
        setLocation(post.location || '');
        setCoords(post.latitude && post.longitude ? { latitude: post.latitude, longitude: post.longitude } : null);
        if (post.createdAt) {
          const dateObj = new Date(post.createdAt);
          setSelectedDate(dateObj.toISOString().split('T')[0]);
          setSelectedTime(dateObj.toTimeString().slice(0, 5));
        }
      } catch (err: any) {
        Alert.alert('Erro', err.message || 'Erro ao carregar dados');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [postId]);

  // Carregar tags disponíveis
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await fetch(`${API_URL}/tags`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setAvailableTags(data.tags || []);
      } catch { }
    };
    fetchTags();
  }, []);

  // Função para escolher nova imagem
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled && result.assets && result.assets[0].uri) {
      setImage(result.assets[0].uri);
    }
  };

  // Função para buscar localização atual
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita acesso à localização.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      const address = await reverseGeocode(loc.coords.latitude, loc.coords.longitude);
      setLocation(address);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível obter localização.');
    }
  };

  // Handler para cliques no mapa
  const handleMapPress = useCallback((event: any) => {
    if (event?.nativeEvent?.coordinate) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setCoords({ latitude, longitude });
      reverseGeocode(latitude, longitude).then(address => {
        setLocation(address);
      });
    }
  }, []);

  // Função para salvar edição
  const handleSave = useCallback(async () => {
    if (!title.trim() || !description.trim()) {
      Toast.show({ type: 'error', text1: 'Título e descrição são obrigatórios.' });
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', description);
      formData.append('tags', selectedTags.join(','));
      formData.append('location', location);
      if (coords) {
        formData.append('latitude', String(coords.latitude));
        formData.append('longitude', String(coords.longitude));
      }
      if (selectedDate) formData.append('createdAt', selectedDate + 'T' + (selectedTime || '00:00'));
      if (image && !image.startsWith('http')) {
        const fileName = image.split('/').pop() || 'image.jpg';
        const fileType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
        formData.append('image', { uri: image, name: fileName, type: fileType } as any);
      }
      // Peso e ranking (opcional, pode ser calculado igual NewInteraction)
      let totalWeight = 0;
      try {
        totalWeight = selectedTags.reduce((sum, tagName) => {
          const tag = availableTags.find((t) => t.name === tagName);
          return sum + (tag && tag.weight ? parseFloat(tag.weight) : 0);
        }, 0);
      } catch { }
      const ranking = totalWeight <= 250 ? 'Baixo' : totalWeight <= 350 ? 'Mediano' : 'Urgente';
      formData.append('weight', String(totalWeight));
      formData.append('ranking', ranking);

      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        // Preparar mensagem dos campos atualizados
        const camposAtualizados = [];
        if (title) camposAtualizados.push('título');
        if (description) camposAtualizados.push('descrição');
        if (selectedTags.length > 0) camposAtualizados.push('tags');
        if (location) camposAtualizados.push('localização');
        if (selectedDate) camposAtualizados.push('data');
        if (selectedTime) camposAtualizados.push('hora');
        if (image && !image.startsWith('http')) camposAtualizados.push('imagem');

        const mensagem = camposAtualizados.length > 0
          ? `Campos atualizados: ${camposAtualizados.join(', ')}`
          : 'Postagem atualizada!';

        Toast.show({
          type: 'success',
          text1: 'Sucesso!',
          text2: mensagem,
          position: 'bottom',
          visibilityTime: 3000
        });
        router.back();
      } else {
        throw new Error(data.message || 'Erro ao atualizar');
      }
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.message || 'Erro ao salvar' });
    } finally {
      setSaving(false);
    }
  }, [title, description, selectedTags, location, coords, selectedDate, selectedTime, image, availableTags]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /><Text>Carregando...</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Editar Postagem</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Título</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Título" />

        <Text style={styles.label}>Descrição</Text>
        <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} placeholder="Descrição" multiline />

        <Text style={styles.label}>Tags</Text>
        <View style={styles.tagsContainer}>
          {availableTags.map((tag) => (
            <TouchableOpacity
              key={tag.name}
              style={[styles.tag, selectedTags.includes(tag.name) && styles.tagSelected]}
              onPress={() => setSelectedTags((prev) => prev.includes(tag.name) ? prev.filter(t => t !== tag.name) : [...prev, tag.name])}
            >
              <Text style={selectedTags.includes(tag.name) ? styles.tagTextSelected : styles.tagText}>{tag.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Localização</Text>
        <LocationPicker
          location={location}
          setLocation={setLocation}
          isManualLocation={isManualLocation}
          setIsManualLocation={setIsManualLocation}
          isOffline={isOffline}
          setCoords={setCoords}
        />

        {coords && (
          <View style={styles.mapContainer}>
            <Text style={styles.mapLabel}>Visualização no mapa</Text>
            <MapViewComponent
              coords={coords}
              handleMapPress={handleMapPress}
              isManualLocation={isManualLocation}
              isOffline={isOffline}
            />
          </View>
        )}

        <Text style={styles.label}>Data</Text>
        <TextInput style={styles.input} value={selectedDate} onChangeText={setSelectedDate} placeholder="AAAA-MM-DD" />

        <Text style={styles.label}>Hora</Text>
        <TextInput style={styles.input} value={selectedTime} onChangeText={setSelectedTime} placeholder="HH:MM" />

        <Text style={styles.label}>Imagem</Text>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : null}
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={{ color: '#fff' }}>{image ? 'Trocar Imagem' : 'Selecionar Imagem'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Salvar Alterações</Text>}
        </TouchableOpacity>
      </View>
      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#F7F8FA', minHeight: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: { fontSize: 26, fontWeight: 'bold', color: '#007AFF', marginBottom: 18, alignSelf: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2, marginBottom: 24 },
  label: { fontWeight: '600', color: '#333', marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: '#F0F1F5', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 4 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  tag: { backgroundColor: '#E0E6ED', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, margin: 4 },
  tagSelected: { backgroundColor: '#007AFF' },
  tagText: { color: '#333' },
  tagTextSelected: { color: '#fff' },
  locButton: { backgroundColor: '#007AFF', borderRadius: 8, padding: 10, marginLeft: 8 },
  image: { width: '100%', height: 180, borderRadius: 12, marginVertical: 8 },
  imageButton: { backgroundColor: '#007AFF', borderRadius: 8, padding: 12, alignItems: 'center', marginVertical: 8 },
  saveButton: { backgroundColor: '#34C759', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 18 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  mapContainer: { marginBottom: 16 },
  mapLabel: { fontSize: 14, color: '#555', marginBottom: 8 },
}); 