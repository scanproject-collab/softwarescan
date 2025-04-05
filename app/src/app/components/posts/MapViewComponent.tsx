import React, { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { Text, StyleSheet, View, Platform } from "react-native";
import * as Location from "expo-location";

interface MapViewComponentProps {
  coords: { latitude: number; longitude: number } | null;
  handleMapPress: (event: any) => void;
  isManualLocation: boolean;
  isOffline: boolean;
}

const MapViewComponent = ({ coords, handleMapPress, isManualLocation, isOffline }: MapViewComponentProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === "granted");

      if (status !== "granted") {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        setHasPermission(newStatus === "granted");
      }
    } catch (err) {
      console.error("Erro ao verificar permissões:", err);
      setError("Erro ao verificar permissões de localização");
      setHasPermission(false);
    }
  };

  const areCoordsValid =
    coords &&
    coords.latitude !== 0 &&
    coords.longitude !== 0 &&
    !isNaN(coords.latitude) &&
    !isNaN(coords.longitude) &&
    Math.abs(coords.latitude) <= 90 &&
    Math.abs(coords.longitude) <= 180;

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (hasPermission === null) {
    return <Text style={styles.mapLoading}>Verificando permissões...</Text>;
  }

  if (hasPermission === false) {
    return <Text style={styles.errorText}>Permissão de localização não concedida</Text>;
  }

  if (!areCoordsValid) {
    return <Text style={styles.mapLoading}>Aguardando coordenadas válidas...</Text>;
  }

  const defaultRegion = {
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        region={
          areCoordsValid
            ? {
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }
            : defaultRegion
        }
        onPress={handleMapPress}
        liteMode={Platform.OS === "android" && isOffline}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {areCoordsValid && (
          <Marker
            coordinate={{
              latitude: coords.latitude,
              longitude: coords.longitude,
            }}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    height: 300,
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
    padding: 10,
  },
  errorText: {
    textAlign: "center",
    color: "red",
    marginBottom: 16,
    padding: 10,
  },
});

export default MapViewComponent;