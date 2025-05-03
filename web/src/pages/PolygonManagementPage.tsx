import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LoadScript } from '@react-google-maps/api';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import api from '../shared/services/api';
import { useAuth } from '../hooks/useAuth';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

// Layouts
import MainLayout from '../layouts/MainLayout';

// Componentes
import MapLoader from '../features/polygons/components/MapLoader';
import PolygonList from '../features/polygons/components/PolygonList';
import PolygonDrawingGuide from '../features/polygons/components/PolygonDrawingGuide';
import DrawingControls from '../features/polygons/components/DrawingControls';
import FilterControls from '../features/polygons/components/FilterControls';
import ExportMapControls from '../features/polygons/components/ExportMapControls';
import MapComponent from '../features/polygons/components/MapComponent';

// Hooks e Utilitários
import { usePolygons } from '../features/polygons/hooks/usePolygons';
import { calculateDistance, formatDate } from '../features/polygons/utils/mapUtils';
import { useInteractions } from '../features/interactions/hooks/useInteractions';

const containerStyle = {
  width: '100%',
  height: 'calc(100vh - 8rem)',
};

const center = {
  lat: -9.6498,
  lng: -35.7089,
};

const PolygonManagementPage: React.FC = () => {
  const { token, user } = useAuth();
  const { polygons, loading: loadingPolygons, deletePolygon } = usePolygons();
  const { interactions: posts, loading: loadingPosts } = useInteractions();

  // Estados para o desenho de polígonos
  const [drawing, setDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<any[]>([]);
  const [drawingGuideVisible, setDrawingGuideVisible] = useState(false);

  // Estados para filtros
  const [filterCoords, setFilterCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [filterDateStart, setFilterDateStart] = useState<string>('');
  const [filterDateEnd, setFilterDateEnd] = useState<string>('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  // Estados para o mapa
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postsInPolygons, setPostsInPolygons] = useState<Map<string, any[]>>(new Map());
  const [selectedPolygon, setSelectedPolygon] = useState<any | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Buscar a chave da API do Google Maps
  useEffect(() => {
    const fetchGoogleMapsApiKey = async () => {
      try {
        const response = await api.get('/google-maps-api-url');
        const url = response.data.url;
        const apiKey = new URLSearchParams(new URL(url).search).get('key') || '';
        if (!url.includes('libraries=geometry')) {
          console.error('A URL da API do Google Maps não inclui a biblioteca geometry:', url);
          toast.error('Configuração da API do Google Maps inválida.');
          return;
        }
        setGoogleMapsApiKey(apiKey);
      } catch (error) {
        console.error('Erro ao buscar API Key do Google Maps:', error);
        toast.error('Erro ao carregar a configuração do mapa.');
      }
    };
    fetchGoogleMapsApiKey();
  }, []);

  // Buscar tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get('/tags', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tagList = response.data.tags.map((tag: any) => tag.name);
        setTags(tagList);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error('Erro ao carregar tags:', errorMessage);
        toast.error('Erro ao carregar tags.');
      }
    };
    fetchTags();
  }, [token]);

  // Filtrar posts com base nos critérios selecionados
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const postDate = new Date(post.createdAt);

      let matchesDateStart = true;
      if (filterDateStart) {
        const startDate = new Date(filterDateStart);
        startDate.setHours(0, 0, 0, 0);
        matchesDateStart = postDate >= startDate;
      }

      let matchesDateEnd = true;
      if (filterDateEnd) {
        const endDate = new Date(filterDateEnd);
        endDate.setHours(23, 59, 59, 999);
        matchesDateEnd = postDate <= endDate;
      }

      const matchesTag = filterTag ? post.tags.some((tag: any) => tag.name === filterTag) : true;
      const matchesSelectedLocation = selectedLocation ? post.location === selectedLocation : true;

      let matchesLocation = true;
      if (filterCoords && post.latitude && post.longitude) {
        const distance = calculateDistance(
          post.latitude,
          post.longitude,
          filterCoords.latitude,
          filterCoords.longitude
        );
        matchesLocation = distance <= 5;
      }

      return matchesDateStart && matchesDateEnd && matchesTag && matchesLocation && matchesSelectedLocation;
    });
  }, [posts, filterDateStart, filterDateEnd, filterTag, selectedLocation, filterCoords]);

  // Alertar quando não houver posts com localização
  useEffect(() => {
    const postsWithLocation = filteredPosts.filter(post =>
      post.latitude && post.longitude
    ).length;
    if (postsWithLocation === 0 && posts.length > 0) {
      toast.error(`Não há posts com localização disponíveis para exibição no mapa`);
    }
  }, [filteredPosts, posts.length]);

  // Adicionar o HeatmapLayer
  useEffect(() => {
    if (isMapLoaded && mapRef.current && window.google.maps.visualization && showHeatmap) {
      const heatmapData = filteredPosts
        .filter(post => post.latitude && post.longitude)
        .map(post => new window.google.maps.LatLng(post.latitude, post.longitude));

      const heatmap = new window.google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: mapRef.current,
        radius: 20,
        opacity: 0.6,
      });

      return () => {
        heatmap.setMap(null);
      };
    }
  }, [isMapLoaded, filteredPosts, showHeatmap]);

  // Calcular posts dentro de cada polígono
  useEffect(() => {
    if (isMapLoaded && mapRef.current && window.google?.maps?.geometry) {
      const newPostsInPolygons = new Map<string, any[]>();

      const fetchTagWeights = async () => {
        try {
          const response = await api.get('/tags', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const tagsWithWeights = response.data.tags;

          polygons.forEach((polygon) => {
            const postsInPolygon = filteredPosts.filter((post) => {
              if (!post.latitude || !post.longitude) return false;
              const point = new window.google.maps.LatLng(post.latitude, post.longitude);
              const polygonPath = new window.google.maps.Polygon({ paths: polygon.points });
              return window.google.maps.geometry.poly.containsLocation(point, polygonPath);
            });

            const postsWithCalculatedWeights = postsInPolygon.map(post => {
              const postTagWeights = (post.tags || []).map((tag: any) => {
                const tagName = typeof tag === 'string' ? tag : tag.name;
                const foundTag = tagsWithWeights.find((t: any) => t.name === tagName);
                return foundTag && foundTag.weight ? parseFloat(foundTag.weight) : 0;
              });

              const totalWeight = postTagWeights.reduce((sum: number, weight: number) => sum + weight, 0);

              let ranking = 'Baixo';
              if (totalWeight > 350) ranking = 'Alto';
              else if (totalWeight > 250) ranking = 'Médio';

              return {
                ...post,
                calculatedWeight: totalWeight,
                calculatedRanking: ranking
              };
            });

            newPostsInPolygons.set(polygon.id, postsWithCalculatedWeights);
          });

          setPostsInPolygons(newPostsInPolygons);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          console.error('Erro ao carregar pesos das tags:', errorMessage);
        }
      };

      fetchTagWeights();
    }
  }, [polygons, filteredPosts, isMapLoaded, token]);

  // Função para manipular cliques no mapa durante o desenho
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (drawing && event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newPoint = { lat, lng };

      if (currentPolygon.length > 2 &&
        Math.abs(currentPolygon[0].lat - lat) < 0.001 &&
        Math.abs(currentPolygon[0].lng - lng) < 0.001) {
        savePolygon();
        return;
      }

      setCurrentPolygon([...currentPolygon, newPoint]);
    }
  };

  // Função para salvar o polígono desenhado
  const savePolygon = async () => {
    if (currentPolygon.length < 3) {
      toast.error('Um polígono deve ter pelo menos 3 pontos.');
      return;
    }
    try {
      const name = prompt('Digite o nome do polígono:');
      if (!name || name.trim() === '') {
        toast.error('Nome do polígono é obrigatório.');
        return;
      }

      const notes = prompt('Digite observações (opcional):');
      const points = currentPolygon.map((point) => ({ lat: point.lat, lng: point.lng }));
      await api.post(
        '/polygons/create',
        { name, points, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentPolygon([]);
      setDrawing(false);
      toast.success('Polígono salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar polígono:', error);
      toast.error('Erro ao salvar polígono.');
    }
  };

  // Função para cancelar o desenho atual
  const handleCancelDrawing = () => {
    if (window.confirm('Deseja cancelar o desenho atual?')) {
      setCurrentPolygon([]);
      setDrawing(false);
    }
  };

  // Função para alternar a visibilidade do guia de desenho
  const toggleDrawingGuide = () => {
    setDrawingGuideVisible(!drawingGuideVisible);
  };

  // Função para salvar o mapa como imagem
  const saveMap = (format: 'png' | 'jpg' | 'pdf') => {
    if (mapRef.current) {
      const mapDiv = document.querySelector('.gm-style') as HTMLElement;
      if (mapDiv) {
        html2canvas(mapDiv, {
          useCORS: true,
          logging: true,
          allowTaint: true,
        }).then((canvas) => {
          if (format === 'png' || format === 'jpg') {
            const link = document.createElement('a');
            link.download = `mapa.${format}`;
            link.href = canvas.toDataURL(`image/${format}`, format === 'jpg' ? 0.9 : 1.0);
            link.click();
          } else if (format === 'pdf') {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('landscape');
            const width = pdf.internal.pageSize.getWidth();
            const height = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = Math.min(width / canvasWidth, height / canvasHeight);
            pdf.addImage(imgData, 'PNG', 0, 0, canvasWidth * ratio, canvasHeight * ratio);
            pdf.save('mapa.pdf');
          }
          setIsModalOpen(false);
        }).catch((error) => {
          console.error('Erro ao salvar o mapa:', error);
          toast.error('Erro ao salvar o mapa.');
        });
      } else {
        toast.error('Não foi possível capturar o mapa.');
      }
    }
  };

  // Função para carregar o mapa
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setIsMapLoaded(true);
  };

  // Função para obter informações de ranking do polígono
  const getPolygonRankingInfo = (polygonId: string) => {
    const postsInPolygon = postsInPolygons.get(polygonId) || [];

    const totalWeight = postsInPolygon.reduce((sum, post) => sum + (post.calculatedWeight || 0), 0);

    let ranking = 'Baixo';
    if (postsInPolygon.some(post => post.calculatedRanking === 'Alto')) {
      ranking = 'Alto';
    } else if (postsInPolygon.some(post => post.calculatedRanking === 'Médio')) {
      ranking = 'Médio';
    }

    return { totalWeight, ranking, count: postsInPolygon.length };
  };

  // Função para limpar filtros de data
  const clearDateFilters = () => {
    setFilterDateStart('');
    setFilterDateEnd('');
  };

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setFilterDateStart('');
    setFilterDateEnd('');
    setFilterTag('');
    setSelectedLocation('');
    setFilterCoords(null);
  };

  // Obter localizações únicas dos posts
  const uniqueLocations = useMemo(() => {
    return Array.from(
      new Set(
        posts
          .map(post => post.location)
          .filter(Boolean)
      )
    );
  }, [posts]);

  if (!googleMapsApiKey) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader className="animate-spin h-8 w-8 text-blue-500" />
          <span className="ml-2 text-blue-500">Carregando configuração do mapa...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-3/4 p-4">
          {loadingPosts || loadingPolygons ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="animate-spin h-8 w-8 text-blue-500" />
              <span className="ml-2 text-blue-500">Carregando dados...</span>
            </div>
          ) : (
            <>
              <div className="mb-4 bg-blue-50 p-2 rounded flex justify-between items-center">
                <div>
                  <span className="font-medium">Total de posts: </span>
                  <span className="text-blue-700">{posts.length}</span>
                  {filteredPosts.length !== posts.length && (
                    <>
                      <span className="mx-2">|</span>
                      <span className="font-medium">Filtrados: </span>
                      <span className="text-green-700">{filteredPosts.length}</span>
                    </>
                  )}
                  {filteredPosts.filter(post => post.latitude && post.longitude).length !== filteredPosts.length && (
                    <>
                      <span className="mx-2">|</span>
                      <span className="font-medium">Com localização: </span>
                      <span className="text-orange-700">{filteredPosts.filter(post => post.latitude && post.longitude).length}</span>
                    </>
                  )}
                </div>
              </div>
              <LoadScript
                googleMapsApiKey={googleMapsApiKey}
                libraries={['geometry', 'visualization']}
                loadingElement={<MapLoader />}
                onLoad={() => setIsMapLoaded(true)}
                onError={(error) => {
                  console.error('Erro ao carregar Google Maps API:', error);
                  toast.error('Falha ao carregar o mapa.');
                }}
              >
                {isMapLoaded && (
                  <div className="relative">
                    <MapComponent
                      mapRef={mapRef}
                      onMapLoad={onMapLoad}
                      center={center}
                      containerStyle={containerStyle}
                      filteredPosts={filteredPosts}
                      polygons={polygons}
                      handleMapClick={handleMapClick}
                      hoveredMarker={hoveredMarker}
                      setHoveredMarker={setHoveredMarker}
                      selectedPolygon={selectedPolygon}
                      setSelectedPolygon={setSelectedPolygon}
                      getPolygonRankingInfo={getPolygonRankingInfo}
                      drawing={drawing}
                      currentPolygon={currentPolygon}
                    />
                  </div>
                )}
              </LoadScript>
            </>
          )}
        </div>
        <div className="w-1/4 bg-blue-100 p-4 overflow-y-auto">
          <PolygonList
            polygons={polygons}
            deletePolygonHandler={deletePolygon}
          />

          <div className="mt-6 space-y-2">
            <DrawingControls
              drawing={drawing}
              setDrawing={setDrawing}
              showHeatmap={showHeatmap}
              setShowHeatmap={setShowHeatmap}
            />

            <PolygonDrawingGuide
              isDrawing={drawing}
              currentPolygon={currentPolygon}
              handleCancelDrawing={handleCancelDrawing}
              savePolygon={savePolygon}
              drawingGuideVisible={drawingGuideVisible}
              toggleDrawingGuide={toggleDrawingGuide}
            />
          </div>

          <FilterControls
            filterDateStart={filterDateStart}
            setFilterDateStart={setFilterDateStart}
            filterDateEnd={filterDateEnd}
            setFilterDateEnd={setFilterDateEnd}
            filterTag={filterTag}
            setFilterTag={setFilterTag}
            tags={tags}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            postLocations={uniqueLocations}
            clearDateFilters={clearDateFilters}
            clearAllFilters={clearAllFilters}
            formatDate={formatDate}
          />
        </div>
      </div>
      <footer className="bg-gray-100 p-4 flex justify-end items-center">
        <ExportMapControls
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          saveMap={saveMap}
        />
      </footer>
    </MainLayout>
  );
};

export default PolygonManagementPage; 