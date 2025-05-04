import React, { useEffect } from 'react';
import { GoogleMap, InfoWindow, Polygon as GooglePolygon, Marker, Polyline } from '@react-google-maps/api';
import { getMarkerIcon, getPolygonColor } from '../utils/mapUtils';
import { Post } from '../types/polygon.types';
import { Polygon, PolygonRankingInfo } from '../types/polygon.types';
import { useNavigate } from 'react-router-dom';

interface MapComponentProps {
  mapRef: React.MutableRefObject<google.maps.Map | null>;
  onMapLoad: (map: google.maps.Map) => void;
  center: { lat: number; lng: number };
  containerStyle: { width: string; height: string };
  filteredPosts: Post[];
  polygons: Polygon[];
  handleMapClick: (event: google.maps.MapMouseEvent) => void;
  hoveredMarker: string | null;
  setHoveredMarker: (id: string | null) => void;
  selectedPolygon: Polygon | null;
  setSelectedPolygon: (polygon: Polygon | null) => void;
  getPolygonRankingInfo: (polygonId: string) => PolygonRankingInfo;
  drawing: boolean;
  currentPolygon: any[];
  placingShape: 'rectangle' | 'circle' | 'triangle' | 'hexagon' | null;
  setCurrentPolygon: (polygon: any[]) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  mapRef,
  onMapLoad,
  center,
  containerStyle,
  filteredPosts,
  polygons,
  handleMapClick,
  hoveredMarker,
  setHoveredMarker,
  selectedPolygon,
  setSelectedPolygon,
  getPolygonRankingInfo,
  drawing,
  currentPolygon,
  placingShape,
  setCurrentPolygon
}) => {
  const navigate = useNavigate();

  // Determinar o cursor apropriado com base no estado atual
  const getCursor = () => {
    if (placingShape) return 'crosshair'; // Cursor de mira quando estiver colocando uma forma
    if (drawing) return 'crosshair'; // Cursor de mira quando estiver desenhando
    return 'grab'; // Cursor padrão para navegação no mapa
  };

  // Manter referência ao polígono editável do Google Maps
  const polygonRef = React.useRef<google.maps.Polygon | null>(null);
  const listenersRef = React.useRef<google.maps.MapsEventListener[]>([]);

  // Limpar event listeners quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (listenersRef.current) {
        listenersRef.current.forEach(listener => {
          google.maps.event.removeListener(listener);
        });
      }
    };
  }, []);

  // Configurar o polígono editável e seus event listeners
  const onPolygonLoad = React.useCallback((polygon: google.maps.Polygon) => {
    polygonRef.current = polygon;
    const path = polygon.getPath();

    // Função para atualizar o polígono quando os pontos são alterados
    const updatePolygonPath = () => {
      const newPath: { lat: number, lng: number }[] = [];
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        newPath.push({
          lat: point.lat(),
          lng: point.lng()
        });
      }
      setCurrentPolygon(newPath);
    };

    // Adicionar listeners para vários eventos que podem alterar o polígono
    listenersRef.current.push(
      google.maps.event.addListener(path, 'set_at', updatePolygonPath),
      google.maps.event.addListener(path, 'insert_at', updatePolygonPath),
      google.maps.event.addListener(path, 'remove_at', updatePolygonPath),
      google.maps.event.addListener(polygon, 'dragend', updatePolygonPath)
    );
  }, [setCurrentPolygon]);

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={center}
      zoom={10}
      mapTypeId="roadmap"
      onLoad={onMapLoad}
      onClick={handleMapClick}
      options={{
        fullscreenControl: true,
        streetViewControl: false,
        mapTypeControl: true,
        zoomControl: true,
        gestureHandling: 'greedy', // Permite mover o mapa mesmo durante o desenho
        draggableCursor: getCursor(), // Define o cursor baseado no estado atual
      }}
    >
      {/* Overlay com instruções quando estiver posicionando uma forma */}
      {placingShape && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white py-2 px-4 rounded-full shadow-lg z-10 font-medium animate-pulse">
          Clique no mapa para posicionar o
          {placingShape === 'rectangle' ? ' retângulo' :
            placingShape === 'circle' ? ' círculo' :
              placingShape === 'triangle' ? ' triângulo' : ' hexágono'}
        </div>
      )}

      {filteredPosts.map(
        (post) =>
          post.latitude &&
          post.longitude && (
            <Marker
              key={post.id}
              position={{ lat: post.latitude, lng: post.longitude }}
              onClick={() => navigate(`/user/${post.author.id}`)}
              onMouseOver={() => setHoveredMarker(post.id)}
              onMouseOut={() => setHoveredMarker(null)}
              icon={{
                url: post.tags && post.tags.length > 0
                  ? getMarkerIcon(typeof post.tags[0] === 'string' ? post.tags[0] : post.tags[0].name)
                  : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new window.google.maps.Size(30, 30),
              }}
            >
              {hoveredMarker === post.id && (
                <InfoWindow
                  position={{ lat: post.latitude, lng: post.longitude }}
                  onCloseClick={() => setHoveredMarker(null)}
                >
                  <div>
                    <h3 className="font-bold">{post.title}</h3>
                    <p>{post.content || 'Sem descrição'}</p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          )
      )}

      {polygons.map((polygon) => {
        const { ranking } = getPolygonRankingInfo(polygon.id);
        const { fillColor, strokeColor } = getPolygonColor(ranking);
        const isSelected = selectedPolygon && selectedPolygon.id === polygon.id;

        return (
          <GooglePolygon
            key={polygon.id}
            paths={polygon.points}
            options={{
              fillColor,
              fillOpacity: isSelected ? 0.7 : 0.5,
              strokeColor: isSelected ? '#000000' : strokeColor,
              strokeWeight: isSelected ? 3 : 2,
              strokeOpacity: 1,
              clickable: true,
              zIndex: isSelected ? 100 : 1 // Polígono selecionado fica acima dos outros
            }}
            onClick={() => setSelectedPolygon(polygon)}
          />
        );
      })}

      {/* Polígono em desenho - adicionado preenchimento amarelo transparente e edição */}
      {drawing && currentPolygon.length > 2 && (
        <GooglePolygon
          paths={currentPolygon}
          options={{
            fillColor: '#FFD700',
            fillOpacity: 0.3,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            editable: true, // Permitir edição dos vértices
            draggable: true, // Permitir arrastar o polígono inteiro
          }}
          onLoad={onPolygonLoad}
        />
      )}

      {/* Linha em desenho quando há menos de 3 pontos */}
      {drawing && currentPolygon.length > 0 && currentPolygon.length < 3 && (
        <Polyline
          path={currentPolygon}
          options={{
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
          }}
        />
      )}

      {/* Marcadores para os pontos do polígono em desenho */}
      {drawing && currentPolygon.length > 0 && currentPolygon.length < 3 &&
        currentPolygon.map((point, index) => (
          <Marker
            key={`drawing-point-${index}`}
            position={point}
            icon={{
              url: index === 0
                ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new window.google.maps.Size(16, 16),
            }}
          />
        ))
      }

      {/* Overlay com instruções quando estiver editando o polígono */}
      {drawing && currentPolygon.length > 2 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white py-2 px-4 rounded-md shadow-lg z-10">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex-shrink-0 p-1 bg-blue-100 text-blue-800 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
            <span className="font-medium text-gray-700">
              Arraste os pontos para ajustar o formato do polígono
            </span>
          </div>
        </div>
      )}

      {selectedPolygon && (
        <InfoWindow
          position={{
            lat: selectedPolygon.points[0].lat,
            lng: selectedPolygon.points[0].lng,
          }}
          onCloseClick={() => setSelectedPolygon(null)}
        >
          <div>
            <h3 className="font-bold">{selectedPolygon.name}</h3>
            <p>Criado por: {selectedPolygon.author?.name || 'Desconhecido'}</p>
            <p>Instituição: {selectedPolygon.author?.institution?.title || 'N/A'}</p>
            <p>Prioridade: {getPolygonRankingInfo(selectedPolygon.id).ranking}</p>
            <p>Peso total: {getPolygonRankingInfo(selectedPolygon.id).totalWeight.toFixed(2)}</p>
            <p>Quantidade de posts: {getPolygonRankingInfo(selectedPolygon.id).count}</p>
            {selectedPolygon.notes && <p>Notas: {selectedPolygon.notes}</p>}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MapComponent; 