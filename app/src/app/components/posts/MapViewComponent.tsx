import React, { useEffect, useState, memo, useRef, useCallback } from "react";
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
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    checkLocationPermission().then(() => {
      // Nada a fazer aqui, o estado já é atualizado dentro da função
    }).catch(err => {
      console.error("Erro ao verificar permissões:", err);
      if (isMounted) {
        setError("Erro ao verificar permissões de localização");
        setHasPermission(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Use a memoized region calculation to prevent unnecessary re-renders
  const region = React.useMemo(() => {
    try {
      if (areCoordsValid(coords)) {
        return {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.0122, // Smaller delta for better performance
          longitudeDelta: 0.0061,
        };
      }
    } catch (error) {
      console.error("Erro ao calcular região do mapa:", error);
      setHasError(true);
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
      throw err;
    }
  };

  const areCoordsValid = useCallback((coordsToCheck: { latitude: number; longitude: number } | null): boolean => {
    if (!coordsToCheck) return false;

    try {
      const { latitude, longitude } = coordsToCheck;

      // Verificar se latitude e longitude são números válidos
      if (latitude === undefined || longitude === undefined) return false;
      if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
      if (isNaN(latitude) || isNaN(longitude)) return false;

      // Verificar se estão dentro dos limites globais
      if (Math.abs(latitude) > 90) return false;
      if (Math.abs(longitude) > 180) return false;

      // Verificar se não são coordenadas zeradas (provavelmente um erro)
      if (latitude === 0 && longitude === 0) return false;

      return true;
    } catch (error) {
      console.error("Erro ao validar coordenadas:", error);
      return false;
    }
  }, []);

  const defaultRegion = {
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleMapPressWithErrorHandling = useCallback((event: any) => {
    try {
      if (event && event.nativeEvent && event.nativeEvent.coordinate) {
        handleMapPress(event);
      }
    } catch (error) {
      console.error("Erro ao processar clique no mapa:", error);
    }
  }, [handleMapPress]);

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (hasPermission === null) {
    return <Text style={styles.mapLoading}>Verificando permissões...</Text>;
  }

  if (hasPermission === false) {
    return <Text style={styles.errorText}>Permissão de localização não concedida</Text>;
  }

  if (!areCoordsValid(coords) || hasError) {
    return <Text style={styles.mapLoading}>Aguardando coordenadas válidas...</Text>;
  }

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
        onPress={handleMapPressWithErrorHandling}
        onMapReady={() => setMapLoaded(true)}
        onError={(error) => {
          console.error("Erro ao carregar o mapa:", error);
          setHasError(true);
        }}
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