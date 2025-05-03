import React, { useRef } from 'react';
import { GoogleMap, InfoWindow, Polygon as GooglePolygon, Marker, Polyline } from '@react-google-maps/api';
import { getMarkerIcon, getPolygonColor } from '../utils/mapUtils';
import { Polygon, Post, PolygonRankingInfo } from '../types/polygon.types';
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
  currentPolygon
}) => {
  const navigate = useNavigate();

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      onClick={handleMapClick}
      onLoad={onMapLoad}
      mapTypeId="roadmap"
    >
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

        return (
          <GooglePolygon
            key={polygon.id}
            paths={polygon.points}
            options={{
              fillColor,
              fillOpacity: 0.5,
              strokeColor,
              strokeWeight: 2,
            }}
            onClick={() => setSelectedPolygon(polygon)}
          />
        );
      })}

      {selectedPolygon && (
        <InfoWindow
          position={{
            lat: selectedPolygon.points.reduce((sum: number, point: any) => sum + point.lat, 0) / selectedPolygon.points.length,
            lng: selectedPolygon.points.reduce((sum: number, point: any) => sum + point.lng, 0) / selectedPolygon.points.length,
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

      {drawing && currentPolygon.length > 0 && (
        <>
          <Polyline
            path={currentPolygon}
            options={{
              strokeColor: '#0077ff',
              strokeWeight: 3,
              strokeOpacity: 0.8,
            }}
          />
          <GooglePolygon
            paths={currentPolygon}
            options={{
              fillColor: 'yellow',
              fillOpacity: 0.3,
              strokeColor: 'red',
              strokeWeight: 2,
              strokeOpacity: 0.5,
            }}
          />
          {currentPolygon.map((point, index) => (
            <Marker
              key={`point-${index}`}
              position={point}
              icon={{
                url: index === 0
                  ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new window.google.maps.Size(20, 20),
              }}
              label={index === 0 ? {
                text: "Início",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: "bold"
              } : undefined}
            />
          ))}
        </>
      )}
    </GoogleMap>
  );
};

export default MapComponent; 