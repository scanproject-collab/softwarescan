import React from "react";
import MapView, { Marker } from "react-native-maps"; 
import { Text, StyleSheet } from "react-native";

interface MapViewComponentProps {
  coords: { latitude: number; longitude: number };
  handleMapPress: (event: any) => void;
  isManualLocation: boolean;
  isOffline: boolean;
}

const MapViewComponent = ({ coords, handleMapPress, isManualLocation, isOffline }: MapViewComponentProps) => {
  // Check if coordinates are valid (not 0, 0)
  const areCoordsValid = coords.latitude !== 0 && coords.longitude !== 0;

  if (isManualLocation && !areCoordsValid) {
    return (
      <Text style={styles.mapLoading}>
        Localização manual selecionada. O mapa não será exibido sem coordenadas.
      </Text>
    );
  }

  if (isOffline) {
    return areCoordsValid ? (
      <MapView
        style={styles.map}
        region={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        liteMode={true}
      >
        <Marker
          coordinate={{
            latitude: coords.latitude,
            longitude: coords.longitude,
          }}
        />
      </MapView>
    ) : (
      <Text style={styles.mapLoading}>
        Modo offline: coordenadas não disponíveis.
      </Text>
    );
  }

  if (!areCoordsValid) {
    return <Text style={styles.mapLoading}>Carregando mapa...</Text>;
  }

  return (
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
  mapLoading: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
});

export default MapViewComponent;