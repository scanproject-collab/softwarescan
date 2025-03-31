import React from "react";
import MapView, { Marker } from "react-native-maps";
import { Text, StyleSheet, View } from "react-native";

interface MapViewComponentProps {
  coords: { latitude: number; longitude: number };
  handleMapPress: (event: any) => void;
  isManualLocation: boolean;
  isOffline: boolean;
}

const MapViewComponent = ({ coords, handleMapPress, isManualLocation, isOffline }: MapViewComponentProps) => {
  // Verificação mais robusta das coordenadas
  const areCoordsValid = coords && 
                        typeof coords.latitude === 'number' && 
                        typeof coords.longitude === 'number' &&
                        coords.latitude !== 0 && 
                        coords.longitude !== 0;

  if (isManualLocation && !areCoordsValid) {
    return (
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapLoading}>
          Localização manual selecionada. O mapa não será exibido sem coordenadas válidas.
        </Text>
      </View>
    );
  }

  if (isOffline) {
    return areCoordsValid ? (
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        liteMode={true}
        scrollEnabled={false}
        zoomEnabled={false}
      >
        <Marker coordinate={coords} />
      </MapView>
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
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      onPress={handleMapPress}
    >
      <Marker coordinate={coords} />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
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
});

export default MapViewComponent;