import React, { useEffect, useState, memo, useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
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
  const mapRef = useRef<MapView>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  // Use a memoized region calculation to prevent unnecessary re-renders
  const region = React.useMemo(() => {
    if (areCoordsValid(coords)) {
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.0122, // Smaller delta for better performance
        longitudeDelta: 0.0061,
      };
    }
    return defaultRegion;
  }, [coords?.latitude, coords?.longitude]);

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

  const areCoordsValid = (coordsToCheck: { latitude: number; longitude: number } | null) =>
    coordsToCheck &&
    coordsToCheck.latitude !== 0 &&
    coordsToCheck.longitude !== 0 &&
    !isNaN(coordsToCheck.latitude) &&
    !isNaN(coordsToCheck.longitude) &&
    Math.abs(coordsToCheck.latitude) <= 90 &&
    Math.abs(coordsToCheck.longitude) <= 180;

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (hasPermission === null) {
    return <Text style={styles.mapLoading}>Verificando permissões...</Text>;
  }

  if (hasPermission === false) {
    return <Text style={styles.errorText}>Permissão de localização não concedida</Text>;
  }

  if (!areCoordsValid(coords)) {
    return <Text style={styles.mapLoading}>Aguardando coordenadas válidas...</Text>;
  }

  const defaultRegion = {
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Calculate map options based on current state
  const mapOptions = {
    // Use Google Maps provider on iOS for better performance
    provider: Platform.OS === 'ios' ? PROVIDER_GOOGLE : undefined,
    // Use lite mode on Android when offline or on slower devices
    liteMode: Platform.OS === "android" && (isOffline || !mapLoaded),
    // Disable features that aren't necessary for this use case to improve performance
    zoomEnabled: true,
    scrollEnabled: true,
    rotateEnabled: false,
    pitchEnabled: false,
    toolbarEnabled: false,
    showsScale: false,
    showsBuildings: false,
    showsTraffic: false,
    showsIndoors: false,
    showsCompass: false,
    showsUserLocation: hasPermission === true,
    showsMyLocationButton: hasPermission === true,
    // Set minimal UI elements
    mapPadding: { top: 0, right: 0, bottom: 0, left: 0 },
  };

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        region={region}
        onPress={handleMapPress}
        onMapReady={() => setMapLoaded(true)}
        {...mapOptions}
      >
        {areCoordsValid(coords) && (
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

// Memoize the component to prevent unnecessary re-renders
export default memo(MapViewComponent);