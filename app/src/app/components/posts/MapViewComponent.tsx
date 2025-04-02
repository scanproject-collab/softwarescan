import React from "react";
import MapView, { Marker } from "react-native-maps";
import { Text, StyleSheet, View } from "react-native";

interface MapViewComponentProps {
  coords: { latitude: number; longitude: number } | null; // Aceita null
  handleMapPress: (event: any) => void;
  isManualLocation: boolean;
  isOffline: boolean;
}

const MapViewComponent = ({ coords, handleMapPress, isManualLocation, isOffline }: MapViewComponentProps) => {
  console.log("MapViewComponent - Coords:", coords);
  console.log("MapViewComponent - isManualLocation:", isManualLocation, "isOffline:", isOffline);

  // Verifica se as coordenadas são válidas
  const areCoordsValid = coords && coords.latitude !== 0 && coords.longitude !== 0 && 
                        !isNaN(coords.latitude) && !isNaN(coords.longitude);

  if (!coords || !areCoordsValid) {
    console.log("Mapa não exibido: coordenadas inválidas ou não carregadas");
    return <Text style={styles.mapLoading}>Carregando mapa...</Text>;
  }

  if (isManualLocation && !areCoordsValid) {
    console.log("Mapa não exibido: localização manual sem coordenadas válidas");
    return (
      <Text style={styles.mapLoading}>
        Localização manual selecionada. O mapa não será exibido sem coordenadas.
      </Text>
    );
  }

  if (isOffline) {
    console.log("Renderizando mapa em modo offline com liteMode");
    return (
      <MapView
        style={styles.map}
        region={{
          latitude: areCoordsValid ? coords.latitude : -23.5505, // Fallback para São Paulo
          longitude: areCoordsValid ? coords.longitude : -46.6333,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        liteMode={true}
      >
        <Marker
          coordinate={{
            latitude: areCoordsValid ? coords.latitude : -23.5505,
            longitude: areCoordsValid ? coords.longitude : -46.6333,
          }}
        />
      </MapView>
    );
  }

  console.log("Renderizando mapa com coordenadas válidas");
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