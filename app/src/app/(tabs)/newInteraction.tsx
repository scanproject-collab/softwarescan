import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPlayerId } from "../utils/expoNotifications";
import { validateToken } from "../utils/auth";
import { Calendar, LocaleConfig } from "react-native-calendars";
import MapView, { Marker } from "react-native-maps";
import { geocodeAddress, reverseGeocode, getPlaceSuggestions } from "../utils/googleMaps";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import "moment/locale/pt-br";
import { useFocusEffect } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import * as FileSystem from "expo-file-system";

moment.locale("pt-br");

LocaleConfig.locales["pt-br"] = {
  monthNames: [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ],
  monthNamesShort: [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ],
  dayNames: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
};
LocaleConfig.defaultLocale = "pt-br";

interface Tag {
  name: string;
  weight: string | null;
}

export default function NewInteraction() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState({ latitude: 0, longitude: 0 });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // Verifica o status da conexão
  const checkConnection = async () => {
    const netInfo = await NetInfo.fetch();
    setIsOffline(!netInfo.isConnected);
    if (!netInfo.isConnected && !isManualLocation) {
      setShowOfflineAlert(true);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setTitle("");
      setDescription("");
      setSelectedTags([]);
      setImage(null);
      setLocation("");
      setCoords({ latitude: 0, longitude: 0 });
      setSelectedDate(new Date().toISOString().split("T")[0]);
      setSelectedTime(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      setSuggestions([]);
      setIsManualLocation(false);
      checkConnection();
      
      // Listener para mudanças de conexão
      const unsubscribe = NetInfo.addEventListener(state => {
        setIsOffline(!state.isConnected);
        if (!state.isConnected && !isManualLocation) {
          setShowOfflineAlert(true);
        } else {
          setShowOfflineAlert(false);
        }
      });
      
      return () => unsubscribe();
    }, [])
  );

  useEffect(() => {
    const initialize = async () => {
      const isValid = await validateToken();
      if (!isValid) return;

      try {
        const token = await AsyncStorage.getItem("userToken");
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tags`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setAvailableTags(data.tags || []);
          await AsyncStorage.setItem("cachedTags", JSON.stringify(data.tags));
        } else {
          const cachedTags = await AsyncStorage.getItem("cachedTags");
          if (cachedTags) setAvailableTags(JSON.parse(cachedTags));
          else Alert.alert("Erro", "Falha ao carregar tags e não há dados em cache.");
        }
      } catch (error) {
        const cachedTags = await AsyncStorage.getItem("cachedTags");
        if (cachedTags) setAvailableTags(JSON.parse(cachedTags));
        else Alert.alert("Erro", "Falha ao carregar tags e não há dados em cache.");
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "A localização é obrigatória para criar a interação.");
        setMapLoaded(true);
        return;
      }

      try {
        const locationData = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = locationData.coords;
        setCoords({ latitude, longitude });
        setMapLoaded(true);
        const address = await reverseGeocode(latitude, longitude);
        setLocation(address);
      } catch (error) {
        setMapLoaded(true);
        setLocation("");
      }

      syncOfflinePosts();
    };
    initialize();
  }, []);

  const pickImage = async () => {
    if (image) {
      Alert.alert("Limite de Imagem", "Só é permitido uma imagem por postagem.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const removeImage = () => {
    Alert.alert("Remover Imagem", "Deseja remover a imagem selecionada?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Remover", style: "destructive", onPress: () => setImage(null) },
    ]);
  };

  const handleToggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  const handleAddressChange = async (text: string) => {
    setLocation(text);
    if (!isManualLocation && text.trim().length >= 3 && !isOffline) {
      const suggestionsList = await getPlaceSuggestions(text);
      setSuggestions(suggestionsList);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = async (suggestion: string) => {
    setLocation(suggestion);
    setSuggestions([]);
    try {
      const response = await geocodeAddress(suggestion);
      setCoords(response);
    } catch (error) {
      Alert.alert("Erro", "Endereço não encontrado.");
    }
  };

  const handleMapPress = async (event: any) => {
    if (isOffline) {
      Alert.alert("Modo Offline", "Você está offline. Para selecionar um local no mapa, ative o modo manual.");
      return;
    }
    
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setCoords({ latitude, longitude });
    try {
      const address = await reverseGeocode(latitude, longitude);
      setLocation(address);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível obter o endereço.");
    }
  };

  const getRankingLabel = (totalWeight: number): string => {
    if (totalWeight <= 5) return "Baixo";
    if (totalWeight <= 10) return "Mediano";
    return "Urgente";
  };

  const getRankingFromTags = () => {
    const totalWeight = selectedTags.reduce((sum, tagName) => {
      const tag = availableTags.find((t) => t.name === tagName);
      const weight = tag && tag.weight ? parseFloat(tag.weight) : 0;
      return sum + weight;
    }, 0);
    const rankingLabel = getRankingLabel(totalWeight);
    return { totalWeight, rankingLabel };
  };

  const syncOfflinePosts = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) return;

    const token = await AsyncStorage.getItem("userToken");
    const offlinePosts = await AsyncStorage.getItem("offlinePosts");
    if (!offlinePosts) return;

    const posts = JSON.parse(offlinePosts);
    for (const post of posts) {
      const formData = new FormData();
      formData.append("title", post.title || "Interação sem título");
      formData.append("content", post.description || "");
      formData.append("tags", post.tags.join(","));
      formData.append("location", post.location);
      formData.append("latitude", post.latitude?.toString() || "");
      formData.append("longitude", post.longitude?.toString() || "");
      formData.append("weight", post.weight);
      formData.append("ranking", post.ranking);

      if (post.image) {
        const fileName = post.image.split("/").pop();
        formData.append("image", {
          uri: post.image,
          type: "image/jpeg",
          name: fileName || "image.jpg",
        } as any);
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/posts/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const updatedPosts = posts.filter((p: any) => p !== post);
        await AsyncStorage.setItem("offlinePosts", JSON.stringify(updatedPosts));
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const isValid = await validateToken();
      if (!isValid) return;

      if (!image) {
        Alert.alert("Erro", "Uma foto é obrigatória para criar a interação.");
        setLoading(false);
        return;
      }
      if (!location.trim()) {
        Alert.alert("Erro", "A localização é obrigatória.");
        setLoading(false);
        return;
      }

      const netInfo = await NetInfo.fetch();
      const token = await AsyncStorage.getItem("userToken");
      const playerId = await getPlayerId();

      if (!netInfo.isConnected || (isManualLocation && !coords.latitude && !coords.longitude)) {
        let imageUri = image;
        if (image) {
          const fileName = image.split("/").pop();
          const newUri = `${FileSystem.cacheDirectory}${fileName}`;
          await FileSystem.copyAsync({ from: image, to: newUri });
          imageUri = newUri;
        }
        const { totalWeight, rankingLabel } = getRankingFromTags();
        const offlinePost = {
          title,
          description,
          tags: selectedTags,
          image: imageUri,
          location,
          latitude: isManualLocation ? null : coords.latitude,
          longitude: isManualLocation ? null : coords.longitude,
          weight: totalWeight.toString(),
          ranking: rankingLabel,
          isManualLocation,
        };
        const offlinePosts = await AsyncStorage.getItem("offlinePosts");
        const posts = offlinePosts ? JSON.parse(offlinePosts) : [];
        posts.push(offlinePost);
        await AsyncStorage.setItem("offlinePosts", JSON.stringify(posts));
        Alert.alert("Sucesso", "Postagem salva localmente. Ela será enviada quando houver conexão.");
        router.push("/");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("title", title || "Interação sem título");
      formData.append("content", description || "");
      formData.append("tags", selectedTags.join(","));
      formData.append("location", location);
      formData.append("latitude", isManualLocation ? "" : coords.latitude.toString());
      formData.append("longitude", isManualLocation ? "" : coords.longitude.toString());
      formData.append("playerId", playerId || "");
      const { totalWeight, rankingLabel } = getRankingFromTags();
      formData.append("weight", totalWeight.toString());
      formData.append("ranking", rankingLabel);

      if (image) {
        const fileName = image.split("/").pop();
        formData.append("image", {
          uri: image,
          type: "image/jpeg",
          name: fileName || "image.jpg",
        } as any);
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/posts/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        router.push("/");
      } else {
        Alert.alert("Erro", data.message || "Falha ao criar interação.");
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um problema ao salvar a interação.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: string }) => {
    if (item === "title") {
      return (
        <>
          {isOffline && (
            <View style={styles.offlineMessage}>
              <Text style={styles.offlineText}>Você está offline. Esta interação será salva localmente.</Text>
            </View>
          )}
          <Text style={styles.sectionTitle}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o título da interação"
            value={title}
            onChangeText={setTitle}
          />
        </>
      );
    }
    if (item === "date") {
      return (
        <>
          <Text style={styles.sectionTitle}>Data</Text>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{ [selectedDate]: { selected: true, disableTouchEvent: true, selectedColor: "#007AFF" } }}
            style={styles.calendar}
            firstDay={1}
            theme={{
              calendarBackground: "#fff",
              textSectionTitleColor: "#333",
              selectedDayBackgroundColor: "#007AFF",
              selectedDayTextColor: "#fff",
              todayTextColor: "#007AFF",
              dayTextColor: "#333",
              textDisabledColor: "#d9e1e8",
              monthTextColor: "#333",
              textMonthFontWeight: "bold",
            }}
          />
          <Text style={styles.hint}>* Selecione a data em que a foto foi tirada.</Text>
        </>
      );
    }
    if (item === "time") {
      return (
        <>
          <Text style={styles.sectionTitle}>Hora</Text>
          <TextInput
            style={styles.input}
            placeholder="hh:mm (ex.: 14:30)"
            value={selectedTime}
            onChangeText={setSelectedTime}
          />
          <Text style={styles.hint}>* Insira a hora em que a foto foi tirada.</Text>
        </>
      );
    }
    if (item === "description") {
      return (
        <>
          <Text style={styles.sectionTitle}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Campo de texto longo"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </>
      );
    }
    if (item === "tags") {
      const { totalWeight, rankingLabel } = getRankingFromTags();
      return (
        <>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagContainer}>
            {availableTags.map((tag) => {
              let tagBackgroundColor = "#e0e0e0";
              if (tag.weight) {
                const weight = parseFloat(tag.weight);
                if (weight >= 10) tagBackgroundColor = "#ff4d4f";
                else if (weight >= 5) tagBackgroundColor = "#ffeb3b";
                else tagBackgroundColor = "#52c41a";
              }
              return (
                <Pressable
                  key={tag.name}
                  style={[
                    styles.tagChip,
                    { backgroundColor: tagBackgroundColor },
                    selectedTags.includes(tag.name) && styles.tagChipSelected,
                  ]}
                  onPress={() => handleToggleTag(tag.name)}
                >
                  <Text style={[styles.tagText, selectedTags.includes(tag.name) && styles.tagTextSelected]}>
                    {tag.weight ? `${tag.name} (${tag.weight})` : tag.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.rankingDisplay}>
            Prioridade Atual: <Text style={styles.rankingValue}>Peso: {totalWeight} | Ranking: {rankingLabel}</Text>
          </Text>
        </>
      );
    }
    if (item === "location") {
      return (
        <>
          <Text style={styles.sectionTitle}>Local</Text>
          {showOfflineAlert && (
            <View style={styles.offlineLocationAlert}>
              <Text style={styles.offlineLocationText}>
                Você está offline. Recomendamos usar o modo manual para localização.
              </Text>
              <Pressable 
                style={styles.offlineLocationButton}
                onPress={() => {
                  setIsManualLocation(true);
                  setShowOfflineAlert(false);
                }}
              >
                <Text style={styles.offlineLocationButtonText}>Usar modo manual</Text>
              </Pressable>
            </View>
          )}
          <View style={styles.locationModeContainer}>
            <Pressable
              style={[styles.modeButton, !isManualLocation && styles.modeButtonActive]}
              onPress={() => {
                if (isOffline) {
                  Alert.alert("Modo Offline", "Você está offline. Para usar localização automática, conecte-se à internet.");
                  return;
                }
                setIsManualLocation(false);
              }}
              disabled={isOffline}
            >
              <Text style={!isManualLocation ? styles.modeButtonTextActive : styles.modeButtonText}>
                Automático
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeButton, isManualLocation && styles.modeButtonActive]}
              onPress={() => setIsManualLocation(true)}
            >
              <Text style={isManualLocation ? styles.modeButtonTextActive : styles.modeButtonText}>
                Manual
              </Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            placeholder={isManualLocation ? "Digite a localização manualmente" : "Digite um endereço ou selecione no mapa"}
            value={location}
            onChangeText={handleAddressChange}
          />
          {!isManualLocation && suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              renderItem={({ item }) => (
                <Pressable style={styles.suggestionItem} onPress={() => handleSuggestionSelect(item)}>
                  <Text>{item}</Text>
                </Pressable>
              )}
              keyExtractor={(item) => item}
              style={styles.suggestionList}
            />
          )}
          {!isManualLocation && mapLoaded && coords.latitude !== 0 && coords.longitude !== 0 ? (
            <MapView
              style={styles.map}
              region={{ latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }}
              onPress={handleMapPress}
            >
              <Marker coordinate={{ latitude: coords.latitude, longitude: coords.longitude }} />
            </MapView>
          ) : !isManualLocation ? (
            <Text style={styles.mapLoading}>Carregando mapa...</Text>
          ) : null}
        </>
      );
    }
    if (item === "image") {
      return (
        <>
          <Pressable
            onPress={pickImage}
            style={[styles.imagePicker, image && styles.imagePickerDisabled]}
            disabled={!!image}
          >
            <Ionicons name="camera-outline" size={24} color="#fff" />
          </Pressable>
          {image && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <Pressable onPress={removeImage} style={styles.removeImageButton}>
                <Text style={styles.removeImageText}>x</Text>
              </Pressable>
            </View>
          )}
        </>
      );
    }
    if (item === "buttons") {
      return (
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isOffline ? "Salvar Localmente" : "Salvar"}
              </Text>
            )}
          </Pressable>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Cancelar</Text>
          </Pressable>
        </View>
      );
    }
    return null;
  };

  const sections = ["title", "date", "time", "description", "tags", "location", "image", "buttons"];

  return (
    <FlatList
      data={sections}
      renderItem={renderItem}
      keyExtractor={(item) => item}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", padding: 16, paddingBottom: 80 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 16, marginBottom: 8 },
  calendar: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 12 },
  input: { height: 50, borderColor: "#ddd", borderWidth: 1, borderRadius: 8, marginBottom: 12, paddingHorizontal: 12, backgroundColor: "#f8f9fa", fontSize: 16 },
  textArea: { height: 100, textAlignVertical: "top", paddingVertical: 12 },
  map: { width: "100%", height: 300, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: "#ddd" },
  mapLoading: { textAlign: "center", color: "#666", marginBottom: 16 },
  suggestionList: { maxHeight: 150, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 12, backgroundColor: "#fff" },
  suggestionItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  tagChip: { borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  tagChipSelected: { backgroundColor: "#FF6633" },
  tagText: { color: "#333", fontSize: 14 },
  tagTextSelected: { color: "#fff" },
  rankingDisplay: { fontSize: 16, color: "#333", marginBottom: 12 },
  rankingValue: { fontWeight: "bold", color: "#092B6E" },
  imagePicker: { backgroundColor: "#FF6633", padding: 12, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: 16, marginTop: 20, width: 50, height: 50, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5 },
  imagePickerDisabled: { backgroundColor: "#99ccff", opacity: 0.6 },
  imageContainer: { position: "relative", marginBottom: 16, alignSelf: "center" },
  imagePreview: { width: 200, height: 200, borderRadius: 12, marginBottom: 16, alignSelf: "center" },
  removeImageButton: { position: "absolute", top: 5, right: 5, backgroundColor: "rgba(255, 59, 48, 0.8)", borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center" },
  removeImageText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, marginBottom: 80 },
  submitButton: { backgroundColor: "#FF6633", padding: 14, borderRadius: 8, alignItems: "center", flex: 1, marginRight: 8 },
  submitButtonDisabled: { backgroundColor: "#99ccff" },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  backButton: { padding: 14, backgroundColor: "#fff", borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: "#007AFF", flex: 1 },
  backButtonText: { color: "#007AFF", fontSize: 16, fontWeight: "600" },
  hint: { fontSize: 12, color: "#666", marginBottom: 12 },
  locationModeContainer: { flexDirection: "row", marginBottom: 12 },
  modeButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginRight: 8,
  },
  modeButtonActive: { backgroundColor: "#FF6633" },
  modeButtonText: { color: "#333" },
  modeButtonTextActive: { color: "#fff" },
  offlineMessage: {
    backgroundColor: "#ffeb3b",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  offlineText: {
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
  },
  offlineLocationAlert: {
    backgroundColor: "#fff3cd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  offlineLocationText: {
    color: "#856404",
    marginBottom: 8,
  },
  offlineLocationButton: {
    backgroundColor: "#ffc107",
    padding: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  offlineLocationButtonText: {
    color: "#856404",
    fontWeight: "bold",
  },
});