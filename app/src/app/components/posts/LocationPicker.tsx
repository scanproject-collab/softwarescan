import React, { useState } from "react";
import { TextInput, Text, View, Pressable, FlatList, StyleSheet, Alert } from "react-native";
import { getPlaceSuggestions, geocodeAddress } from "@/src/app/utils/GoogleMaps";

interface LocationPickerProps {
  location: string;
  setLocation: (location: string) => void;
  isManualLocation: boolean;
  setIsManualLocation: (isManual: boolean) => void;
  isOffline: boolean;
  setCoords: (coords: { latitude: number; longitude: number }) => void;
}

const LocationPicker = ({
  location,
  setLocation,
  isManualLocation,
  setIsManualLocation,
  isOffline,
  setCoords,
}: LocationPickerProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

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
    if (!isOffline && !isManualLocation) {
      try {
        console.log("Tentando geocodificar:", suggestion);
        const response = await geocodeAddress(suggestion);
        console.log("Coordenadas obtidas:", response);
        setCoords(response);
      } catch (error) {
        console.error("Erro ao geocodificar:", error);
        Alert.alert("Erro", "Endereço não encontrado.");
      }
    } else {
      Alert.alert("Aviso", "Localização manual salva. Coordenadas não serão obtidas até que haja conexão.");
    }
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Local</Text>
      <View style={styles.locationModeContainer}>
        <Pressable
          style={[styles.modeButton, !isManualLocation && styles.modeButtonActive]}
          onPress={() => !isOffline && setIsManualLocation(false)}
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
      {!isManualLocation && !isOffline && suggestions.length > 0 && (
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
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 16, marginBottom: 8 },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    fontSize: 16,
  },
  locationModeContainer: { flexDirection: "row", marginBottom: 12 },
  modeButton: { padding: 8, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginRight: 8 },
  modeButtonActive: { backgroundColor: "#FF6633" },
  modeButtonText: { color: "#333" },
  modeButtonTextActive: { color: "#fff" },
  suggestionList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  suggestionItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
});

export default LocationPicker;