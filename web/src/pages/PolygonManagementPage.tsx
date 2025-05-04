import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LoadScript } from '@react-google-maps/api';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import api from '../shared/services/api';
import { useAuth } from '../hooks/useAuth';
import { Loader, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Post } from '../features/polygons/types/polygon.types';

// Layouts
import MainLayout from '../layouts/MainLayout';

// Componentes
import MapLoader from '../features/polygons/components/MapLoader';
import PolygonList from '../features/polygons/components/PolygonList';
import DrawingGuide from '../features/polygons/components/DrawingGuide';
import FilterControls from '../features/polygons/components/FilterControls';
import MapComponent from '../features/polygons/components/MapComponent';
import PolygonDialog from '../features/polygons/components/PolygonDialog';
import PredefinedShapes from '../features/polygons/components/PredefinedShapes';

// Hooks e Utilitários
import { usePolygons } from '../features/polygons/hooks/usePolygons';
import { formatDate } from '../features/polygons/utils/mapUtils';
import { useInteractions } from '../features/interactions/hooks/useInteractions';

// Define libraries as a constant to avoid new array on each render
const GOOGLE_MAPS_LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ['geometry', 'visualization', 'drawing'];

const containerStyle = {
  width: '100%',
  height: '100%', // Use 100% instead of calculation to fill parent container
};

const center = {
  lat: -9.6498,
  lng: -35.7089,
};

interface ExtendedInteraction {
  id: string;
  title?: string;
  content?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string | Date;
  tags?: any[];
  location?: string;
  author: {
    id: string;
    name?: string;
    email?: string;
    institution?: {
      id: string;
      title?: string;
    };
  };
  calculatedWeight?: number;
  calculatedRanking?: string;
  weight?: string | number;
  imageUrl?: string;
  ranking?: string;
}

const PolygonManagementPage: React.FC = () => {
  const { token } = useAuth();
  const { polygons, loading: loadingPolygons, deletePolygon, fetchPolygons } = usePolygons();
  const { interactions: posts, loading: loadingPosts } = useInteractions();

  // Estados para o desenho de polígonos
  const [drawing, setDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<any[]>([]);
  const [drawingGuideVisible, setDrawingGuideVisible] = useState(false);

  // Estados para filtros
  const [filterDateStart, setFilterDateStart] = useState<string>('');
  const [filterDateEnd, setFilterDateEnd] = useState<string>('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  // Estados para o mapa
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postsInPolygons, setPostsInPolygons] = useState<Map<string, ExtendedInteraction[]>>(new Map());
  const [selectedPolygon, setSelectedPolygon] = useState<any | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Adicionar estados para controlar o modo de colocação de formas pré-definidas
  const [placingShape, setPlacingShape] = useState<'rectangle' | 'circle' | 'triangle' | 'hexagon' | null>(null);

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
      // Add type guards for dates and optional fields
      const postDate = post.createdAt ? new Date(post.createdAt) : new Date();

      // Check if post is within date range
      const matchesStartDate = !filterDateStart || postDate >= new Date(filterDateStart);
      const matchesEndDate = !filterDateEnd || postDate <= new Date(filterDateEnd);

      // Check if post matches selected tag
      const matchesTag = filterTag
        ? (post.tags && post.tags.some((tag: any) =>
          typeof tag === 'string' ? tag === filterTag : tag.name === filterTag))
        : true;

      // Check if post matches selected location
      const matchesSelectedLocation = selectedLocation
        ? ((post as any).location && (post as any).location === selectedLocation)
        : true;

      return matchesStartDate && matchesEndDate && matchesTag && matchesSelectedLocation;
    });
  }, [posts, filterDateStart, filterDateEnd, filterTag, selectedLocation]);

  // Fix filteredPosts issue for MapComponent
  const typedFilteredPosts = useMemo(() => {
    return filteredPosts.map(post => ({
      id: post.id,
      title: post.title || '',
      content: post.content || '',
      latitude: post.latitude,
      longitude: post.longitude,
      createdAt: post.createdAt || '',
      tags: post.tags || [],
      location: (post as any).location || '',
      author: post.author,
    })) as Post[];
  }, [filteredPosts]);

  // Alertar quando não houver posts com localização
  useEffect(() => {
    const postsWithLocation = filteredPosts.filter(post =>
      post.latitude && post.longitude
    ).length;
    if (postsWithLocation === 0 && posts.length > 0) {
      toast.error(`Não há posts com localização disponíveis para exibição no mapa`);
    }
  }, [filteredPosts, posts.length]);

  // Improved heatmap functionality with proper cleanup
  useEffect(() => {
    if (isMapLoaded && mapRef.current && window.google?.maps?.visualization) {
      // Clear previous heatmap if it exists
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
        heatmapRef.current = null;
      }

      if (showHeatmap) {
        try {
          const validPoints = filteredPosts
            .filter(post => typeof post.latitude === 'number' && typeof post.longitude === 'number')
            .map(post => {
              // Ensure we have valid coordinates
              const lat = Number(post.latitude);
              const lng = Number(post.longitude);

              if (isNaN(lat) || isNaN(lng)) return null;

              return {
                location: new window.google.maps.LatLng(lat, lng),
                weight: post.tags && post.tags.length ? post.tags.length * 2 : 1 // Weight by number of tags
              };
            })
            .filter(Boolean) as google.maps.visualization.WeightedLocation[];

          if (validPoints.length > 0) {
            const heatmap = new window.google.maps.visualization.HeatmapLayer({
              data: validPoints,
              map: mapRef.current,
              radius: 30, // Increased radius for better visibility
              opacity: 0.7, // Increased opacity
              dissipating: true,
              maxIntensity: 10, // Adjusted for more stable visualization
              gradient: [
                'rgba(0, 255, 255, 0)',
                'rgba(0, 255, 255, 1)',
                'rgba(0, 191, 255, 1)',
                'rgba(0, 127, 255, 1)',
                'rgba(0, 63, 255, 1)',
                'rgba(0, 0, 255, 1)',
                'rgba(0, 0, 223, 1)',
                'rgba(0, 0, 191, 1)',
                'rgba(0, 0, 159, 1)',
                'rgba(0, 0, 127, 1)',
                'rgba(63, 0, 91, 1)',
                'rgba(127, 0, 63, 1)',
                'rgba(191, 0, 31, 1)',
                'rgba(255, 0, 0, 1)'
              ]
            });

            heatmapRef.current = heatmap;
          } else {
            toast.error('Não há dados suficientes para gerar o mapa de calor');
          }
        } catch (error) {
          console.error('Erro ao criar mapa de calor:', error);
          toast.error('Erro ao gerar o mapa de calor');
        }
      }
    }

    return () => {
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
        heatmapRef.current = null;
      }
    };
  }, [isMapLoaded, filteredPosts, showHeatmap]);

  // Calcular posts dentro de cada polígono
  useEffect(() => {
    if (isMapLoaded && mapRef.current && window.google?.maps?.geometry) {
      const newPostsInPolygons = new Map<string, ExtendedInteraction[]>();

      const fetchTagWeights = async () => {
        try {
          const response = await api.get('/tags', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const tagsWithWeights = response.data.tags;

          polygons.forEach((polygon) => {
            const postsInPolygon = filteredPosts.filter((post) => {
              if (!post.latitude || !post.longitude) return false;

              try {
                const point = new window.google.maps.LatLng(
                  Number(post.latitude),
                  Number(post.longitude)
                );
                const polygonPath = new window.google.maps.Polygon({ paths: polygon.points });
                return window.google.maps.geometry.poly.containsLocation(point, polygonPath);
              } catch (error) {
                console.error('Erro ao verificar ponto no polígono:', error);
                return false;
              }
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
                calculatedRanking: ranking,
                createdAt: typeof post.createdAt === 'object' ?
                  (post.createdAt as Date).toISOString() :
                  post.createdAt
              } as ExtendedInteraction;
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

  // Modificar a função para iniciar o processo de colocação de forma
  const handleSelectShape = useCallback((shape: 'rectangle' | 'circle' | 'triangle' | 'hexagon') => {
    setPlacingShape(shape);
    toast.success(`Clique no mapa para posicionar o ${shape === 'rectangle' ? 'retângulo' :
      shape === 'circle' ? 'círculo' :
        shape === 'triangle' ? 'triângulo' : 'hexágono'
      }`);
  }, []);

  // Modificar a função handleMapClick para suportar a colocação de formas pré-definidas
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    // Se estamos no modo de colocação de forma pré-definida
    if (placingShape) {
      generateShapeAtPosition(placingShape, { lat, lng });
      setPlacingShape(null); // Sair do modo de colocação após posicionar
      return;
    }

    // Modo de desenho normal
    if (drawing) {
      const newPoint = { lat, lng };

      // Check if the click closes the polygon (near the first point)
      if (currentPolygon.length > 2 &&
        Math.abs(currentPolygon[0].lat - lat) < 0.001 &&
        Math.abs(currentPolygon[0].lng - lng) < 0.001) {
        beginSavePolygon();
        return;
      }

      // Add the point to the current polygon
      setCurrentPolygon(prev => [...prev, newPoint]);
    }
  }, [drawing, currentPolygon, placingShape]);

  // Adicionar função para gerar forma em uma posição específica
  const generateShapeAtPosition = useCallback((shape: 'rectangle' | 'circle' | 'triangle' | 'hexagon', center: { lat: number, lng: number }) => {
    const { lat, lng } = center;

    // Calcular o "tamanho" da forma baseado no nível de zoom
    const zoom = mapRef.current?.getZoom() || 12;
    const sizeMultiplier = 0.01 / Math.pow(1.5, (zoom - 10) / 3); // Ajusta tamanho com base no zoom

    let points: { lat: number, lng: number }[] = [];

    switch (shape) {
      case 'rectangle':
        points = [
          { lat: lat - sizeMultiplier, lng: lng - sizeMultiplier },
          { lat: lat - sizeMultiplier, lng: lng + sizeMultiplier },
          { lat: lat + sizeMultiplier, lng: lng + sizeMultiplier },
          { lat: lat + sizeMultiplier, lng: lng - sizeMultiplier }
        ];
        break;
      case 'circle':
        // Para um "círculo", criamos um polígono com vários lados
        for (let i = 0; i < 24; i++) {
          const angle = (Math.PI * 2 * i) / 24;
          points.push({
            lat: lat + Math.sin(angle) * sizeMultiplier,
            lng: lng + Math.cos(angle) * sizeMultiplier
          });
        }
        break;
      case 'triangle':
        points = [
          { lat: lat + sizeMultiplier, lng: lng },
          { lat: lat - sizeMultiplier / 2, lng: lng - sizeMultiplier },
          { lat: lat - sizeMultiplier / 2, lng: lng + sizeMultiplier }
        ];
        break;
      case 'hexagon':
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 * i) / 6;
          points.push({
            lat: lat + Math.sin(angle) * sizeMultiplier,
            lng: lng + Math.cos(angle) * sizeMultiplier
          });
        }
        break;
    }

    setDrawing(true);
    setCurrentPolygon(points);
  }, [mapRef]);

  // Função para iniciar o salvamento do polígono
  const beginSavePolygon = () => {
    if (currentPolygon.length < 3) {
      toast.error('Um polígono deve ter pelo menos 3 pontos.');
      return;
    }
    setIsDialogOpen(true);
  };

  // Função chamada quando o diálogo é confirmado
  const savePolygon = async (name: string, notes: string) => {
    try {
      const points = currentPolygon.map((point) => ({ lat: point.lat, lng: point.lng }));
      await api.post(
        '/polygons',
        { name, points, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentPolygon([]);
      setDrawing(false);
      setIsDialogOpen(false);
      toast.success('Polígono salvo com sucesso!');

      // Atualizar a lista de polígonos
      await fetchPolygons();
    } catch (error) {
      console.error('Erro ao salvar polígono:', error);
      toast.error('Erro ao salvar polígono.');
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
        // Configure html2canvas with better options for map capture
        html2canvas(mapDiv, {
          useCORS: true,
          logging: false,
          allowTaint: true,
          scale: 2, // Increased scale for better quality
          backgroundColor: null,
          ignoreElements: (element) => {
            // Ignore certain Google Maps elements that cause problems
            return element.classList?.contains('gm-style-cc') ||
              element.classList?.contains('gmnoprint');
          }
        }).then((canvas) => {
          if (format === 'png' || format === 'jpg') {
            const link = document.createElement('a');
            link.download = `mapa-${new Date().toISOString().slice(0, 10)}.${format}`;
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
            pdf.save(`mapa-${new Date().toISOString().slice(0, 10)}.pdf`);
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
  };

  // Obter localizações únicas dos posts
  const uniqueLocations = useMemo(() => {
    return Array.from(
      new Set(
        posts
          .map(post => (post as any).location)
          .filter(Boolean)
      )
    );
  }, [posts]);

  // Função para centralizar o mapa em um polígono específico
  const centerPolygonOnMap = useCallback((polygon: any) => {
    if (!mapRef.current || !polygon.points || polygon.points.length === 0) return;

    // Calcular o centro do polígono
    const bounds = new window.google.maps.LatLngBounds();
    polygon.points.forEach((point: { lat: number; lng: number }) => {
      bounds.extend(new window.google.maps.LatLng(point.lat, point.lng));
    });

    // Centralizar o mapa nesse polígono
    mapRef.current.fitBounds(bounds);

    // Selecionar o polígono para mostrar suas informações
    setSelectedPolygon(polygon);

    // Aplicar um pequeno zoom out para melhor visualização
    setTimeout(() => {
      if (mapRef.current) {
        const currentZoom = mapRef.current.getZoom() || 15;
        mapRef.current.setZoom(currentZoom - 0.5);
      }
    }, 100);
  }, [mapRef]);

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

  // Counter for posts with location data - used for badge
  const postsWithLocationCount = filteredPosts.filter(post => post.latitude && post.longitude).length;

  return (
    <MainLayout>
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
        <div className="w-5/6 p-0">
          {loadingPosts || loadingPolygons ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="animate-spin h-8 w-8 text-blue-500" />
              <span className="ml-2 text-blue-500">Carregando dados...</span>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="bg-white p-3 rounded-lg flex justify-between items-center shadow mx-2 mt-2">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center bg-blue-50 px-4 py-2 rounded-lg">
                    <span className="font-bold text-xl text-blue-600">{posts.length}</span>
                    <span className="text-sm text-gray-600">Total de posts</span>
                  </div>

                  {filteredPosts.length !== posts.length && (
                    <div className="flex flex-col items-center bg-blue-50 px-4 py-2 rounded-lg">
                      <span className="font-bold text-xl text-blue-600">{filteredPosts.length}</span>
                      <span className="text-sm text-gray-600">Filtrados</span>
                    </div>
                  )}

                  {postsWithLocationCount > 0 && (
                    <div className="flex flex-col items-center bg-blue-50 px-4 py-2 rounded-lg">
                      <span className="font-bold text-xl text-orange-500">{postsWithLocationCount}</span>
                      <span className="text-sm text-gray-600">Com localização</span>
                    </div>
                  )}
                </div>

                {showHeatmap && (
                  <div className="bg-gradient-to-r from-blue-500 to-orange-500 text-white px-4 py-2 rounded-full animate-pulse font-medium">
                    Mapa de calor ativo
                  </div>
                )}
              </div>
              <div className="flex-1 m-2">
                <LoadScript
                  googleMapsApiKey={googleMapsApiKey}
                  libraries={GOOGLE_MAPS_LIBRARIES}
                  loadingElement={<MapLoader />}
                  onLoad={() => setIsMapLoaded(true)}
                  onError={(error) => {
                    console.error('Erro ao carregar Google Maps API:', error);
                    toast.error('Falha ao carregar o mapa.');
                  }}
                >
                  {isMapLoaded && (
                    <div className="w-full h-full border-2 border-blue-200 rounded-lg shadow-lg overflow-hidden">
                      <MapComponent
                        mapRef={mapRef}
                        onMapLoad={onMapLoad}
                        center={center}
                        containerStyle={containerStyle}
                        filteredPosts={typedFilteredPosts}
                        polygons={polygons}
                        handleMapClick={handleMapClick}
                        hoveredMarker={hoveredMarker}
                        setHoveredMarker={setHoveredMarker}
                        selectedPolygon={selectedPolygon}
                        setSelectedPolygon={setSelectedPolygon}
                        getPolygonRankingInfo={getPolygonRankingInfo}
                        drawing={drawing}
                        currentPolygon={currentPolygon}
                        placingShape={placingShape}
                        setCurrentPolygon={setCurrentPolygon}
                      />
                    </div>
                  )}
                </LoadScript>
              </div>
            </div>
          )}
        </div>
        <div className="w-1/6 bg-blue-50 p-3 overflow-y-auto h-full">
          <h2 className="text-lg font-semibold mb-4 text-blue-700">Locais</h2>

          <PolygonList
            polygons={polygons}
            deletePolygonHandler={deletePolygon}
            onCenterPolygon={centerPolygonOnMap}
          />

          <div className="mt-6 space-y-3">
            <button
              onClick={() => {
                if (drawing) {
                  setCurrentPolygon([]);
                }
                setDrawing(prev => !prev);
              }}
              className={`w-full py-3 px-4 rounded-md text-white font-medium flex items-center justify-center ${drawing
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              {drawing ? 'Cancelar Desenho' : 'Desenhar Polígono'}
            </button>

            {drawing && (
              <PredefinedShapes onSelectShape={handleSelectShape} />
            )}

            <button
              onClick={() => setShowHeatmap(prev => !prev)}
              className={`w-full py-3 px-4 rounded-md text-white font-medium flex items-center justify-center ${showHeatmap
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-green-500 hover:bg-green-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
              {showHeatmap ? 'Desativar Heatmap' : 'Ativar Heatmap'}
            </button>

            <DrawingGuide
              isVisible={drawingGuideVisible}
              onToggle={toggleDrawingGuide}
            />

            {drawing && currentPolygon.length >= 3 && (
              <button
                onClick={beginSavePolygon}
                className="w-full py-2 px-4 rounded-md bg-green-500 hover:bg-green-600 text-white font-medium flex items-center justify-center"
              >
                <Check className="h-5 w-5 mr-2" />
                Concluir Polígono
              </button>
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2 text-blue-700">Gerenciar Locais</h3>
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
      </div>
      <footer className="bg-gray-100 p-3 flex justify-end items-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium shadow-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
          </svg>
          Exportar Mapa
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <h3 className="text-lg font-semibold mb-4 text-blue-700">Exportar Mapa</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => saveMap('png')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  PNG
                </button>
                <button
                  onClick={() => saveMap('jpg')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  JPG
                </button>
                <button
                  onClick={() => saveMap('pdf')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md"
                >
                  PDF
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </footer>

      {/* Dialog para salvar polígono */}
      <PolygonDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={savePolygon}
      />
    </MainLayout>
  );
};

export default PolygonManagementPage; 