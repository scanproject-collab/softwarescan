import React from "react";
import MapView, { Marker } from "react-native-maps"; // Ajuste na importação
import { Text, StyleSheet } from "react-native";

interface MapViewComponentProps {
  coords: { latitude: number; longitude: number };
  handleMapPress: (event: any) => void;
  isManualLocation: boolean;
  isOffline: boolean;
}

const MapViewComponent = ({ coords, handleMapPress, isManualLocation, isOffline }: MapViewComponentProps) => {
  // Caso esteja em modo manual e sem coordenadas válidas
  if (isManualLocation && coords.latitude === 0 && coords.longitude === 0) {
    return (
      <Text style={styles.mapLoading}>
        Localização manual selecionada. O mapa não será exibido sem coordenadas.
      </Text>
    );
  }

  // Caso esteja offline, usa o modo lite com coordenadas padrão ou fornecidas
  if (isOffline) {
    return (
      <MapView
        style={styles.map}
        region={{
          latitude: coords.latitude || -23.5505, // São Paulo como fallback
          longitude: coords.longitude || -46.6333,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        liteMode={true} // Modo leve para offline
      >
        <Marker
          coordinate={{
            latitude: coords.latitude || -23.5505,
            longitude: coords.longitude || -46.6333,
          }}
        />
      </MapView>
    );
  }

  if (!isManualLocation && !isOffline && coords.latitude === 0 && coords.longitude === 0) {
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