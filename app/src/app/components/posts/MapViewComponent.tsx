import React, { useState, useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import { Text, StyleSheet, View } from "react-native";

interface MapViewComponentProps {
  coords: { latitude: number; longitude: number };
  handleMapPress: (event: any) => void;
  isManualLocation: boolean;
  isOffline: boolean;
}

const MapViewComponent = ({ coords, handleMapPress, isManualLocation, isOffline }: MapViewComponentProps) => {
  const [mapError, setMapError] = useState<string | null>(null);

  const areCoordsValid = coords &&
    typeof coords.latitude === "number" &&
    typeof coords.longitude === "number" &&
    !isNaN(coords.latitude) &&
    !isNaN(coords.longitude) &&
    coords.latitude !== 0 &&
    coords.longitude !== 0 &&
    Math.abs(coords.latitude) <= 90 &&
    Math.abs(coords.longitude) <= 180;

  useEffect(() => {
    setMapError(null); 
  }, [coords, isManualLocation, isOffline]);

  const handleMapError = () => {
    setMapError("Erro ao carregar o mapa. Tente novamente.");
  };
  if (isManualLocation && !areCoordsValid) {
    return (
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapLoading}>
          Localização manual selecionada. Insira um endereço válido para exibir o mapa.
        </Text>
      </View>
    );
  }

  
  if (isOffline) {
    return areCoordsValid ? (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          liteMode={true} 
        >
          <Marker coordinate={coords} />
        </MapView>
        {mapError && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>{mapError}</Text>
          </View>
        )}
      </View>
    ) : (
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapLoading}>
          Modo offline: coordenadas não disponíveis.
        </Text>
      </View>
    );
  }

  if (!areCoordsValid) {
    return (
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapLoading}>Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
        onError={handleMapError}
      >
        <Marker coordinate={coords} />
      </MapView>
      {mapError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{mapError}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    width: "100%",
    height: 300,
    position: "relative",
    marginBottom: 16,
  },
  map: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  mapPlaceholder: {
    width: "100%",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  mapLoading: {
    textAlign: "center",
    color: "#666",
    padding: 16,
  },
  errorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderRadius: 8,
  },
  errorText: {
    color: "#f44336",
    textAlign: "center",
    padding: 16,
  },
});

export default MapViewComponent;