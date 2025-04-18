import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleMap, LoadScript, InfoWindow, Polygon as GooglePolygon, Marker, Polyline } from '@react-google-maps/api';
import { geocodeAddress, getPlaceSuggestions } from '../utils/googleMaps.ts';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import api from '../services/api.ts';
import { useAuth } from '../hooks/useAuth.ts';
import Navbar from '../components/Navbar.tsx';
import { Loader, Download, Pencil, X, Check, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '../components/ui/dialog.tsx';

const containerStyle = {
    width: '100%',
    height: 'calc(100vh - 8rem)',
};

const center = {
    lat: -9.6498,
    lng: -35.7089,
};

const MapLoader: React.FC = () => (
    <div className="flex justify-center items-center h-full">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2 text-blue-500">Carregando mapa...</span>
    </div>
);

const PolygonManagement: React.FC = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState<any[]>([]);
    const [polygons, setPolygons] = useState<any[]>([]);
    const [drawing, setDrawing] = useState(false);
    const [currentPolygon, setCurrentPolygon] = useState<any[]>([]);
    const [filterLocation, setFilterLocation] = useState<string>('');
    const [filterCoords, setFilterCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [filterDateStart, setFilterDateStart] = useState<string>('');
    const [filterDateEnd, setFilterDateEnd] = useState<string>('');
    const [filterTag, setFilterTag] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingPolygons, setLoadingPolygons] = useState(true);
    const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
    const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [postsInPolygons, setPostsInPolygons] = useState<Map<string, any[]>>(new Map());
    const [selectedPolygon, setSelectedPolygon] = useState<any | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [drawingGuideVisible, setDrawingGuideVisible] = useState(false);
    const mapRef = useRef<google.maps.Map | null>(null);

    const basePath = user?.role === "MANAGER" ? "/manager" : "/admin";

    useEffect(() => {
        const fetchGoogleMapsApiKey = async () => {
            try {
                const response = await api.get('/google-maps-api-url');
                const url = response.data.url;
                const apiKey = new URLSearchParams(new URL(url).search).get('key') || '';
                // API key logging removed for security reasons
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

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoadingPosts(true);
                const response = await api.get(`${basePath}/listAllPosts`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPosts(response.data.posts);
            } catch (error) {
                // Properly type check the error before accessing message property
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                console.error('Erro ao carregar posts:', errorMessage);
                toast.error('Erro ao carregar posts. Verifique o console para mais detalhes.');
            } finally {
                setLoadingPosts(false);
            }
        };

        const fetchPolygons = async () => {
            try {
                setLoadingPolygons(true);
                // Caso seja MANAGER, só buscar polígonos criados pelo próprio usuário ou
                // polígonos associados à mesma instituição 
                const response = await api.get('/polygons', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { role: user?.role, institutionId: user?.institutionId }
                });
                setPolygons(response.data.polygons);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                console.error('Erro ao carregar polígonos:', errorMessage);
                toast.error('Erro ao carregar polígonos.');
            } finally {
                setLoadingPolygons(false);
            }
        };

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

        fetchPosts();
        fetchPolygons();
        fetchTags();
    }, [token, user?.role]);

    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            const postDate = new Date(post.createdAt);

            // Melhorar a lógica de filtragem por data
            let matchesDateStart = true;
            if (filterDateStart) {
                // Definir início do dia selecionado
                const startDate = new Date(filterDateStart);
                startDate.setHours(0, 0, 0, 0);
                matchesDateStart = postDate >= startDate;
            }

            let matchesDateEnd = true;
            if (filterDateEnd) {
                // Definir fim do dia selecionado
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

    useEffect(() => {
        // Debug post data without exposing sensitive info
        const postsWithLocation = filteredPosts.filter(post =>
            post.latitude && post.longitude
        ).length;
        if (postsWithLocation === 0 && posts.length > 0) {
            toast.error(`Não há posts com localização disponíveis para exibição no mapa`);
        }
    }, [filteredPosts, posts.length]);

    useEffect(() => {
        if (isMapLoaded && mapRef.current && window.google?.maps?.geometry) {
            const newPostsInPolygons = new Map<string, any[]>();

            // Fetch tag information to get weights
            const fetchTagWeights = async () => {
                try {
                    const response = await api.get('/tags', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const tagsWithWeights = response.data.tags;

                    // Process each polygon
                    polygons.forEach((polygon) => {
                        const postsInPolygon = filteredPosts.filter((post) => {
                            if (!post.latitude || !post.longitude) return false;
                            const point = new window.google.maps.LatLng(post.latitude, post.longitude);
                            const polygonPath = new window.google.maps.Polygon({ paths: polygon.points });
                            return window.google.maps.geometry.poly.containsLocation(point, polygonPath);
                        });

                        // Calculate total weight for each post based on its tags
                        const postsWithCalculatedWeights = postsInPolygon.map(post => {
                            // Get the numeric weights of all tags in the post
                            const postTagWeights = (post.tags || []).map((tag: any) => {
                                const tagName = typeof tag === 'string' ? tag : tag.name;
                                const foundTag = tagsWithWeights.find((t: any) => t.name === tagName);
                                return foundTag && foundTag.weight ? parseFloat(foundTag.weight) : 0;
                            });

                            // Sum up the weights
                            const totalWeight = postTagWeights.reduce((sum: number, weight: number) => sum + weight, 0);

                            // Determine ranking based on total weight
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

    const uniqueLocations = Array.from(new Set(posts.map(post => post.location).filter(Boolean))) as string[];

    const handleLocationChange = async (text: string) => {
        setFilterLocation(text);
        if (text.trim().length < 3) {
            setSuggestions([]);
            setFilterCoords(null);
            return;
        }
        const suggestionsList = await getPlaceSuggestions(text);
        setSuggestions(suggestionsList);
    };

    const handleSuggestionSelect = async (suggestion: string) => {
        setFilterLocation(suggestion);
        setSuggestions([]);
        try {
            const coords = await geocodeAddress(suggestion);
            setFilterCoords(coords);
        } catch (error) {
            toast.error('Endereço não encontrado. Tente outro endereço.');
        }
    };

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
            const response = await api.get('/polygons', {
                headers: { Authorization: `Bearer ${token}` },
                params: { role: user?.role, institutionId: user?.institutionId }
            });
            setPolygons(response.data.polygons);
            toast.success('Polígono salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar polígono:', error);
            toast.error('Erro ao salvar polígono.');
        }
    };

    const handleCancelDrawing = () => {
        if (window.confirm('Deseja cancelar o desenho atual?')) {
            setCurrentPolygon([]);
            setDrawing(false);
        }
    };

    const deletePolygonHandler = async (polygonId: string) => {
        if (window.confirm('Deseja excluir este polígono?')) {
            try {
                await api.delete(`/polygons/${polygonId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPolygons(polygons.filter((p) => p.id !== polygonId));
                toast.success('Polígono excluído com sucesso!');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                console.error('Erro ao excluir polígono:', errorMessage);
                toast.error('Erro ao excluir polígono.');
            }
        }
    };

    const toggleDrawingGuide = () => {
        setDrawingGuideVisible(!drawingGuideVisible);
    };

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

    const calculateDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const onMapLoad = (map: google.maps.Map) => {
        mapRef.current = map;
        // console logging removed
    };

    const getMarkerIcon = (tag: string) => {
        switch (tag) {
            case 'Roubo':
                return "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
            case 'Furto':
                return "https://maps.google.com/mapfiles/ms/icons/orange-dot.png";
            case 'Assalto':
                return "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
            case 'Homicídio':
                return "https://maps.google.com/mapfiles/ms/icons/purple-dot.png";
            default:
                return "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
        }
    };

    const getPolygonColor = (weight: string) => {
        switch (weight) {
            case 'Alto':
                return { fillColor: 'red', strokeColor: 'red' };
            case 'Médio':
                return { fillColor: 'orange', strokeColor: 'orange' };
            case 'Baixo':
            default:
                return { fillColor: 'yellow', strokeColor: 'yellow' };
        }
    };

    const getPolygonRankingInfo = (polygonId: string) => {
        const postsInPolygon = postsInPolygons.get(polygonId) || [];

        // Calculate total weight by summing weights of all posts
        const totalWeight = postsInPolygon.reduce((sum, post) => sum + (post.calculatedWeight || 0), 0);

        // Determine overall ranking based on highest post ranking
        let ranking = 'Baixo';
        if (postsInPolygon.some(post => post.calculatedRanking === 'Alto')) {
            ranking = 'Alto';
        } else if (postsInPolygon.some(post => post.calculatedRanking === 'Médio')) {
            ranking = 'Médio';
        }

        return { totalWeight, ranking, count: postsInPolygon.length };
    };

    // Função para formatar a data em formato brasileiro
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const clearDateFilters = () => {
        setFilterDateStart('');
        setFilterDateEnd('');
    };

    if (!googleMapsApiKey) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader className="animate-spin h-8 w-8 text-blue-500" />
                <span className="ml-2 text-blue-500">Carregando configuração do mapa...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen">
            <Navbar />
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

                                {(filterDateStart || filterDateEnd || filterTag || selectedLocation) && (
                                    <div className="flex items-center gap-2">
                                        {(filterDateStart || filterDateEnd) && (
                                            <div className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                <span>Período: </span>
                                                {filterDateStart && <span>{formatDate(filterDateStart)}</span>}
                                                {filterDateStart && filterDateEnd && <span> até </span>}
                                                {filterDateEnd && <span>{formatDate(filterDateEnd)}</span>}
                                                <button
                                                    onClick={clearDateFilters}
                                                    className="ml-1 text-red-500 hover:text-red-700"
                                                    title="Limpar filtro de data"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                setFilterDateStart('');
                                                setFilterDateEnd('');
                                                setFilterTag('');
                                                setSelectedLocation('');
                                                setFilterCoords(null);
                                            }}
                                            className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                                            title="Limpar todos os filtros"
                                        >
                                            Limpar todos
                                        </button>
                                    </div>
                                )}
                            </div>
                            <LoadScript
                                googleMapsApiKey={googleMapsApiKey}
                                libraries={['geometry']}
                                loadingElement={<MapLoader />}
                                onLoad={() => {
                                    setIsMapLoaded(true);
                                }}
                                onError={(error) => {
                                    console.error('Erro ao carregar Google Maps API:', error);
                                    toast.error('Falha ao carregar o mapa.');
                                }}
                            >
                                {isMapLoaded && (
                                    <div className="relative">
                                        {drawing && (
                                            <div className="absolute top-4 left-4 z-10 bg-white p-3 rounded shadow-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Pencil size={16} className="text-blue-500" />
                                                    <span className="font-semibold text-blue-800">Modo de Desenho Ativo</span>
                                                </div>
                                                <div className="text-sm text-gray-600 mb-2">
                                                    Clique no mapa para adicionar pontos ao polígono.
                                                    <br />
                                                    Clique próximo ao ponto inicial para fechar o polígono.
                                                </div>
                                                <div className="flex justify-between">
                                                    <button
                                                        onClick={handleCancelDrawing}
                                                        className="flex items-center gap-1 text-sm bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                                                    >
                                                        <X size={14} />
                                                        Cancelar
                                                    </button>
                                                    {currentPolygon.length >= 3 && (
                                                        <button
                                                            onClick={savePolygon}
                                                            className="flex items-center gap-1 text-sm bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200"
                                                        >
                                                            <Check size={14} />
                                                            Concluir
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
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
                                                const { totalWeight, ranking } = getPolygonRankingInfo(polygon.id);
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
                                                    {/* Linha de conexão entre os pontos */}
                                                    <Polyline
                                                        path={currentPolygon}
                                                        options={{
                                                            strokeColor: '#0077ff',
                                                            strokeWeight: 3,
                                                            strokeOpacity: 0.8,
                                                        }}
                                                    />

                                                    {/* Polígono em construção */}
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

                                                    {/* Marcadores para cada ponto */}
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
                                    </div>
                                )}
                            </LoadScript>
                        </>
                    )}
                </div>
                <div className="w-1/4 bg-blue-100 p-4 overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">Locais</h2>
                    <ul className="space-y-2">
                        {polygons.map((polygon) => (
                            <li key={polygon.id} className="flex justify-between items-center p-2 bg-white rounded shadow">
                                <span className="flex items-center">
                                    <span className="w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
                                    {polygon.name}
                                </span>
                                <button
                                    onClick={() => deletePolygonHandler(polygon.id)}
                                    className="text-gray-500 hover:text-red-700"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-6 space-y-2">
                        <button
                            onClick={() => setDrawing(!drawing)}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white ${drawing ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                        >
                            {drawing ? (
                                <>
                                    <X className="h-5 w-5" />
                                    <span>Parar de Desenhar</span>
                                </>
                            ) : (
                                <>
                                    <Pencil className="h-5 w-5" />
                                    <span>Desenhar Polígono</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={toggleDrawingGuide}
                            className="w-full flex items-center justify-center gap-2 bg-blue-100 text-blue-700 border border-blue-300 px-4 py-2 rounded-lg hover:bg-blue-200"
                        >
                            <Info className="h-4 w-4" />
                            <span>Como desenhar?</span>
                        </button>

                        {drawingGuideVisible && (
                            <div className="mt-2 p-3 bg-white rounded shadow-md text-sm">
                                <h3 className="font-bold text-blue-800 mb-1">Como desenhar um polígono:</h3>
                                <ol className="list-decimal ml-5 space-y-1">
                                    <li>Clique no botão "Desenhar Polígono"</li>
                                    <li>Clique em pontos no mapa para criar vértices</li>
                                    <li>O primeiro ponto será marcado em verde (início)</li>
                                    <li>Para fechar o polígono, clique próximo ao ponto inicial</li>
                                    <li>Preencha o nome e as informações quando solicitado</li>
                                </ol>
                                <p className="mt-2 text-gray-600">Um polígono deve ter pelo menos 3 pontos para ser válido.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gerenciar Locais</label>
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
                        >
                            <option value="">Todas as Localizações</option>
                            {uniqueLocations.map((location) => (
                                <option key={location} value={location}>
                                    {location}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <footer className="bg-gray-100 p-4 flex justify-between items-center flex-wrap gap-4">
                <div className="flex space-x-2">
                    <div className="flex flex-col">
                        <label htmlFor="date-start" className="text-sm font-medium text-gray-700 mb-1">
                            Data de início
                        </label>
                        <div className="relative">
                            <input
                                id="date-start"
                                type="date"
                                value={filterDateStart}
                                onChange={(e) => setFilterDateStart(e.target.value)}
                                className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                aria-label="Filtrar postagens a partir desta data"
                                title="Selecione a data inicial para filtrar posts"
                            />
                            {filterDateStart && (
                                <button
                                    onClick={() => setFilterDateStart('')}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    title="Limpar data inicial"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="date-end" className="text-sm font-medium text-gray-700 mb-1">
                            Data de fim
                        </label>
                        <div className="relative">
                            <input
                                id="date-end"
                                type="date"
                                value={filterDateEnd}
                                onChange={(e) => setFilterDateEnd(e.target.value)}
                                className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                aria-label="Filtrar postagens até esta data"
                                title="Selecione a data final para filtrar posts"
                            />
                            {filterDateEnd && (
                                <button
                                    onClick={() => setFilterDateEnd('')}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    title="Limpar data final"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="tag-filter" className="text-sm font-medium text-gray-700 mb-1">
                            Filtrar por Tag
                        </label>
                        <select
                            id="tag-filter"
                            value={filterTag}
                            onChange={(e) => setFilterTag(e.target.value)}
                            className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Filtrar postagens por tag"
                        >
                            <option value="">Todas as Tags</option>
                            {tags.map((tag) => (
                                <option key={tag} value={tag}>
                                    {tag}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
                            Salvar mapa como imagem
                        </button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                        <DialogTitle className="text-xl font-semibold text-gray-800">
                            Escolha o formato de download
                        </DialogTitle>
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <button
                                onClick={() => saveMap('png')}
                                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <Download className="w-5 h-5" />
                                <span>PNG</span>
                            </button>
                            <button
                                onClick={() => saveMap('jpg')}
                                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white py-3 px-4 rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                <Download className="w-5 h-5" />
                                <span>JPG</span>
                            </button>
                            <button
                                onClick={() => saveMap('pdf')}
                                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg shadow-md hover:from-red-600 hover:to-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                                <Download className="w-5 h-5" />
                                <span>PDF</span>
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            </footer>
        </div>
    );
};

export default PolygonManagement;