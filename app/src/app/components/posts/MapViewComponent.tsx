import React, { useEffect, useState, memo, useRef, useCallback } from "react";
import MapView, { Marker, MapViewProps, PROVIDER_GOOGLE } from "react-native-maps";
import { Text, StyleSheet, View, Platform, TouchableOpacity } from "react-native";
import * as Location from "expo-location";

interface MapViewComponentProps {
  coords: { latitude: number; longitude: number } | null;
  handleMapPress: (event: any) => void;
  isManualLocation: boolean;
  isOffline: boolean;
}

const MapViewComponent = ({ coords, handleMapPress, isManualLocation, isOffline }: MapViewComponentProps) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [permissionChecked, setPermissionChecked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const mapRef = useRef<MapView | null>(null);

  // Verificar permissões no carregamento
  useEffect(() => {
    let mounted = true;

    const checkPermission = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (mounted) {
          setHasPermission(status === "granted");
          setPermissionChecked(true);

          // Se não tiver permissão, pedir ao usuário
          if (status !== "granted") {
            const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
            if (mounted) {
              setHasPermission(newStatus === "granted");
            }
          }
        }
      } catch (err) {
        console.error("Erro ao verificar permissões:", err);
        if (mounted) {
          setError("Erro ao verificar permissões de localização");
          setPermissionChecked(true);
        }
      }
    };

    checkPermission();

    return () => {
      mounted = false;
    };
  }, []);

  // Validar as coordenadas
  const coordsAreValid = useCallback((c: any): boolean => {
    if (!c) return false;

    try {
      return (
        typeof c === 'object' &&
        'latitude' in c &&
        'longitude' in c &&
        typeof c.latitude === 'number' &&
        typeof c.longitude === 'number' &&
        !isNaN(c.latitude) &&
        !isNaN(c.longitude) &&
        Math.abs(c.latitude) <= 90 &&
        Math.abs(c.longitude) <= 180
      );
    } catch (error) {
      console.error("Erro ao validar coordenadas:", error);
      return false;
    }
  }, []);

  const handleMapError = useCallback(() => {
    setError("Erro ao carregar o mapa");
  }, []);

  const handleMapPressWrapper = useCallback((event: any) => {
    try {
      if (event?.nativeEvent?.coordinate) {
        handleMapPress(event);
      }
    } catch (error) {
      console.error("Erro ao processar clique no mapa:", error);
    }
  }, [handleMapPress]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Componente de erro
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={resetError} style={styles.retryButton}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Aguardando verificação de permissão
  if (!permissionChecked) {
    return <Text style={styles.loadingText}>Verificando permissões...</Text>;
  }

  // Sem permissão de localização
  if (!hasPermission) {
    return <Text style={styles.errorText}>Permissão de localização não concedida</Text>;
  }

  // Aguardando coordenadas
  if (!coordsAreValid(coords)) {
    return <Text style={styles.loadingText}>Aguardando coordenadas válidas...</Text>;
  }

  // Se chegamos aqui, temos coordenadas válidas
  const validCoords = coords as { latitude: number; longitude: number };

  // Configurar a região do mapa
  const region = {
    latitude: validCoords.latitude,
    longitude: validCoords.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  // Propriedades do mapa com tipagem correta
  const mapProps: MapViewProps = {
    initialRegion: region,
    region: region,
    onPress: handleMapPressWrapper,
    onMapReady: () => setMapLoaded(true),
    zoomEnabled: true,
    scrollEnabled: true,
    rotateEnabled: false,
    pitchEnabled: false,
    toolbarEnabled: false,
    showsCompass: false,
    showsScale: false,
    showsUserLocation: true,
    showsMyLocationButton: true,
  };

  // Adicionar o provider apenas para iOS para evitar erros de tipagem
  if (Platform.OS === 'ios') {
    (mapProps as any).provider = PROVIDER_GOOGLE;
  }

  // Usar modo lite em Android quando offline ou mapa não carregado
  if (Platform.OS === 'android' && (isOffline || !mapLoaded)) {
    (mapProps as any).liteMode = true;
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        {...mapProps}
      >
        <Marker coordinate={validCoords} />
      </MapView>

      {!mapLoaded && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingOverlayText}>Carregando mapa...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    marginVertical: 16,
    height: 300,
    textAlignVertical: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: "center",
    color: "red",
    marginBottom: 8,
  },
  retryButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  retryText: {
    color: "#0066cc",
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlayText: {
    fontSize: 16,
    color: '#333',
  }
});

export default memo(MapViewComponent);