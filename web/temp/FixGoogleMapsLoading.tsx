import React, { useState, useCallback, useEffect } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Polygon,
  HeatmapLayer
} from '@react-google-maps/api';

/**
 * This is an example of correct Google Maps implementation in React/TypeScript
 * that avoids the common errors:
 * - "F is undefined" 
 * - "google is not defined"
 * - Element "already defined" errors
 */

// 1. Define libraries outside the component to avoid re-renders
// Using const assertion to ensure the array isn't recreated on each render
// This helps prevent "Element already defined" errors
const libraries = ["places", "geometry", "visualization"] as const;

// 2. Define a map container style outside the component
const mapContainerStyle = {
  width: '100%',
  height: '600px'
};

// 3. Define a default center position
const center = {
  lat: -9.6498, // Default to Maceió
  lng: -35.7089
};

// 4. Create a proper Error Boundary for Google Maps components
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error in Google Maps component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-[600px] w-full">
          <p className="text-red-500 text-xl mb-4">Erro ao carregar o Google Maps. Tente recarregar a página.</p>
          <p className="text-gray-500 text-sm">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 5. Create a loading indicator component
const MapLoader = () => (
  <div className="flex justify-center items-center h-[600px]">
    <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    <span className="ml-2 text-blue-500">Carregando mapa...</span>
  </div>
);

// 6. Main component that implements Google Maps correctly
const GoogleMapsComponent: React.FC = () => {
  // 7. Get API key from environment variables
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  
  // 8. Track map state
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  
  // 9. Define some demo markers for the map
  const markers = [
    { id: '1', position: { lat: -9.6498, lng: -35.7089 }, title: 'Marcador 1' },
    { id: '2', position: { lat: -9.6598, lng: -35.7189 }, title: 'Marcador 2' },
    { id: '3', position: { lat: -9.6398, lng: -35.6989 }, title: 'Marcador 3' },
  ];
  
  // 10. Use useJsApiLoader hook to load the Google Maps script with proper configuration
  // This is the CORRECT way to load Google Maps in React
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey,
    libraries,
    id: 'google-map-script', // Set a unique ID to prevent duplicates
    version: 'weekly',       // Use 'weekly' version to get the latest features
    language: 'pt-BR',       // Set language to Portuguese (Brazil)
    region: 'BR',            // Set region to Brazil
  });

  // 11. Use a separate effect to log loading success or failure
  useEffect(() => {
    if (loadError) {
      console.error('Erro ao carregar Google Maps API:', loadError);
    }
    
    if (isLoaded && window.google?.maps) {
      console.log('Google Maps API carregada com sucesso');
    }
  }, [isLoaded, loadError]);

  // 12. Handle map load with useCallback to avoid unnecessary re-renders
  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log('Mapa carregado com sucesso');
    setMap(map);
  }, []);

  // 13. Clean up the map instance when component unmounts
  useEffect(() => {
    return () => {
      if (map) {
        console.log('Limpando instância do mapa');
        // No need to explicitly clean up the map instance
        // as React will handle the DOM cleanup
        setMap(null);
      }
    };
  }, [map]);

  // 14. Early render for API key missing
  if (!googleMapsApiKey) {
    return (
      <div className="flex justify-center items-center h-[600px]">
        <div className="bg-red-100 p-4 rounded-lg text-red-800">
          <h3 className="font-bold text-lg">Erro de Configuração</h3>
          <p>A chave de API do Google Maps não está configurada.</p>
          <p className="text-sm mt-2">
            Configure a variável VITE_GOOGLE_MAPS_API_KEY no arquivo .env
          </p>
        </div>
      </div>
    );
  }

  // 15. Render load error state
  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] w-full">
        <p className="text-red-500 text-xl mb-4">Erro ao carregar o Google Maps. Tente recarregar a página.</p>
        <p className="text-gray-500 text-sm">{loadError.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Recarregar Página
        </button>
      </div>
    );
  }

  // 16. Render loading state
  if (!isLoaded) {
    return <MapLoader />;
  }

  // 17. Only render GoogleMap when API is loaded
  return (
    <MapErrorBoundary>
      <div className="relative w-full h-[600px]">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
          onLoad={onMapLoad}
          options={{
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
          }}
        >
          {/* 18. Always verify window.google exists before using any Google Maps objects */}
          {window.google && markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              onClick={() => setSelectedMarker(marker.id)}
              // Safe access to google.maps classes since we already checked isLoaded
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new window.google.maps.Size(30, 30),
              }}
            />
          ))}

          {/* 19. Only render InfoWindow when a marker is selected */}
          {selectedMarker && window.google && (
            <InfoWindow
              position={markers.find(m => m.id === selectedMarker)?.position || center}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2">
                <h3 className="font-bold">{markers.find(m => m.id === selectedMarker)?.title}</h3>
                <p>Informações adicionais sobre este marcador.</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </MapErrorBoundary>
  );
};

export default GoogleMapsComponent;

/**
 * CHEAT SHEET FOR FIXING GOOGLE MAPS ISSUES:
 * 
 * 1. Always use useJsApiLoader instead of LoadScript
 *    - LoadScript can cause "Element already defined" errors
 *    - useJsApiLoader gives more control and better loading states
 * 
 * 2. Prevent "F is undefined" and "google is not defined" errors:
 *    - Use isLoaded state before rendering any map components
 *    - Check window.google exists before using any Google Maps objects
 *    - Wrap map components with error boundaries
 * 
 * 3. Avoid element duplication:
 *    - Define libraries array outside component with const assertion
 *    - Use a unique 'id' in useJsApiLoader options
 *    - Never render LoadScript and useJsApiLoader together
 * 
 * 4. Properly handle errors and loading states:
 *    - Show meaningful error messages
 *    - Provide reload option for users
 *    - Use proper loading indicators
 * 
 * 5. Correctly integrate with your specific component:
 *    - Move your specific map functionality (markers, polygons, etc.) into the
 *      GoogleMap component ONLY after checking isLoaded is true
 *    - Keep your state management for filters, selections, etc. separate from
 *      the map loading logic
 */

