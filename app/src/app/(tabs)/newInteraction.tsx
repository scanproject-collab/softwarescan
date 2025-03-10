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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPlayerId } from "../utils/oneSignal";
import { validateToken } from "../utils/auth";
import { Calendar } from "react-native-calendars";
import MapView, { Marker } from "react-native-maps";
import { geocodeAddress, reverseGeocode, getPlaceSuggestions } from "../utils/googleMaps";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import "moment/locale/pt-br";

const rankings = ["Urgente", "Mediano", "Baixo"];

export default function NewInteraction() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState({ latitude: 0, longitude: 0 });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
  const [selectedRanking, setSelectedRanking] = useState<string | null>(null);
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    // Configura o locale do moment para português
    moment.locale("pt-br");

    const initialize = async () => {
      const isValid = await validateToken();
      if (!isValid) return;

      try {
        const token = await AsyncStorage.getItem("userToken");
        const response = await fetch(`${API_URL}/tags`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setAvailableTags(data.tags || []);
        } else {
          Alert.alert("Erro", "Falha ao carregar tags.");
        }
      } catch (error) {
        console.error("Erro ao buscar tags:", error);
        Alert.alert("Erro", "Falha ao carregar tags.");
      }

      // Pedir permissão de localização
      console.log("Solicitando permissão de localização...");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
            "Permissão negada",
            "O Softwarescan precisa de acesso à sua localização para funcionar corretamente. Você pode continuar sem ela, mas alguns recursos estarão limitados."
        );
        setMapLoaded(true);
        return;
      }

      try {
        console.log("Obtendo localização atual...");
        const locationData = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        });
        const { latitude, longitude } = locationData.coords;
        console.log("Coordenadas obtidas:", { latitude, longitude });
        setCoords({ latitude, longitude });
        setMapLoaded(true);

        try {
          const address = await reverseGeocode(latitude, longitude);
          console.log("Endereço inicial:", address);
          setLocation(address);
        } catch (geoError) {
          console.warn("Erro ao obter endereço inicial:", geoError);
          setLocation("Localização não disponível");
        }
      } catch (error) {
        console.error("Erro ao obter localização:", error);
        setMapLoaded(true);
        setLocation("Localização não disponível");
      }
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
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const removeImage = () => {
    Alert.alert("Remover Imagem", "Deseja remover a imagem selecionada?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Remover", style: "destructive", onPress: () => setImage(null) },
    ]);
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSelectRanking = (ranking: string) => {
    setSelectedRanking(ranking);
  };

  const handleAddressChange = async (text: string) => {
    setLocation(text);
    if (text.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const suggestionsList = await getPlaceSuggestions(text);
    setSuggestions(suggestionsList);
  };

  const handleSuggestionSelect = async (suggestion: string) => {
    setLocation(suggestion);
    setSuggestions([]);
    try {
      const response = await geocodeAddress(suggestion);
      setCoords(response);
    } catch (error) {
      Alert.alert("Erro", "Endereço não encontrado. Tente outro endereço ou selecione no mapa.");
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setCoords({ latitude, longitude });
    try {
      const address = await reverseGeocode(latitude, longitude);
      setLocation(address);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível obter o endereço para essa localização.");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const isValid = await validateToken();
      if (!isValid) return;

      const token = await AsyncStorage.getItem("userToken");
      const playerId = await getPlayerId();

      const formData = new FormData();
      formData.append("title", title || "Interação sem título");
      formData.append("content", description || "");
      formData.append("tags", selectedTags.join(","));
      if (image) {
        formData.append("image", { uri: image, name: "image.jpg", type: "image/jpeg" } as any);
      }
      formData.append("playerId", playerId || "");
      formData.append("ranking", selectedRanking || "Baixo");

      if (coords.latitude !== 0 && coords.longitude !== 0 && location.trim()) {
        formData.append("location", location);
        formData.append("latitude", coords.latitude.toString());
        formData.append("longitude", coords.longitude.toString());
      }

      const response = await fetch(`${API_URL}/posts/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.status === 401) {
        console.log("Token inválido ou expirado, redirecionando para login");
        await AsyncStorage.removeItem("userToken");
        router.replace("/pages/auth");
        return;
      }

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

                monthNames={[
                  "Janeiro",
                  "Fevereiro",
                  "Março",
                  "Abril",
                  "Maio",
                  "Junho",
                  "Julho",
                  "Agosto",
                  "Setembro",
                  "Outubro",
                  "Novembro",
                  "Dezembro",
                ]}
                monthNamesShort={[
                  "Jan",
                  "Fev",
                  "Mar",
                  "Abr",
                  "Mai",
                  "Jun",
                  "Jul",
                  "Ago",
                  "Set",
                  "Out",
                  "Nov",
                  "Dez",
                ]}
                dayNames={["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]}
                dayNamesShort={["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]}
                firstDay={1}
                locale="pt-BR"
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
            <Text style={styles.hint}>* Selecione a data em que a foto foi tirada (pode ser diferente do dia atual).</Text>
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
            <Text style={styles.hint}>* Insira a hora em que a foto foi tirada (pode diferir do horário atual).</Text>
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
      return (
          <>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagContainer}>
              {availableTags.map((tag) => (
                  <Pressable
                      key={tag}
                      style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipSelected]}
                      onPress={() => handleToggleTag(tag)}
                  >
                    <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextSelected]}>{tag}</Text>
                  </Pressable>
              ))}
            </View>
          </>
      );
    }
    if (item === "ranking") {
      return (
          <>
            <Text style={styles.sectionTitle}>Ranking</Text>
            <View style={styles.rankingContainer}>
              {rankings.map((ranking) => (
                  <Pressable
                      key={ranking}
                      onPress={() => handleSelectRanking(ranking)}
                      style={[styles.rankingItem, selectedRanking === ranking && styles.rankingItemSelected]}
                  >
                    <Text style={[styles.rankingText, selectedRanking === ranking && styles.rankingTextSelected]}>{ranking}</Text>
                  </Pressable>
              ))}
            </View>
          </>
      );
    }
    if (item === "location") {
      return (
          <>
            <Text style={styles.sectionTitle}>Local (Opcional)</Text>
            <TextInput
                style={styles.input}
                placeholder="Digite um endereço (ex.: Rua Exemplo, Cidade) ou selecione no mapa"
                value={location}
                onChangeText={handleAddressChange}
            />
            {suggestions.length > 0 && (
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
            {mapLoaded && coords.latitude !== 0 && coords.longitude !== 0 ? (
                <MapView
                    style={styles.map}
                    region={{ latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }}
                    onPress={handleMapPress}
                >
                  <Marker coordinate={{ latitude: coords.latitude, longitude: coords.longitude }} />
                </MapView>
            ) : (
                <Text style={styles.mapLoading}>Carregando mapa...</Text>
            )}
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
              <Text style={styles.submitButtonText}>{loading ? "Salvando..." : "Salvar"}</Text>
            </Pressable>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Cancelar</Text>
            </Pressable>
          </View>
      );
    }
    return null;
  };

  const sections = ["title", "date", "time", "description", "tags", "ranking", "location", "image", "buttons"];

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
  tagChip: { backgroundColor: "#e0e0e0", borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  tagChipSelected: { backgroundColor: "#007AFF" },
  tagText: { color: "#333", fontSize: 14 },
  tagTextSelected: { color: "#fff" },
  rankingContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  rankingItem: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginRight: 8, marginBottom: 8, backgroundColor: "#e0e0e0" },
  rankingItemSelected: { backgroundColor: "#007AFF" },
  rankingText: { color: "#333", fontSize: 16 },
  rankingTextSelected: { color: "#fff" },
  imagePicker: { backgroundColor: "#007AFF", padding: 12, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: 16, marginTop: 20, width: 50, height: 50, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5 },
  imagePickerDisabled: { backgroundColor: "#99ccff", opacity: 0.6 },
  imageContainer: { position: "relative", marginBottom: 16, alignSelf: "center" },
  imagePreview: { width: 200, height: 200, borderRadius: 12, marginBottom: 16, alignSelf: "center" },
  removeImageButton: { position: "absolute", top: 5, right: 5, backgroundColor: "rgba(255, 59, 48, 0.8)", borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center" },
  removeImageText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, marginBottom: 80 },
  submitButton: { backgroundColor: "#007AFF", padding: 14, borderRadius: 8, alignItems: "center", flex: 1, marginRight: 8 },
  submitButtonDisabled: { backgroundColor: "#99ccff" },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  backButton: { padding: 14, backgroundColor: "#fff", borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: "#007AFF", flex: 1 },
  backButtonText: { color: "#007AFF", fontSize: 16, fontWeight: "600" },
  hint: { fontSize: 12, color: "#666", marginBottom: 12 },
});