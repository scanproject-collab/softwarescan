import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polygon as GooglePolygon } from '@react-google-maps/api';
import html2canvas from 'html2canvas';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';
import { Loader } from 'lucide-react';

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
    const { token } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [polygons, setPolygons] = useState<any[]>([]);
    const [drawing, setDrawing] = useState(false);
    const [currentPolygon, setCurrentPolygon] = useState<any[]>([]);
    const [filter, setFilter] = useState('Todos');
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingPolygons, setLoadingPolygons] = useState(true);
    const mapRef = useRef<google.maps.Map | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoadingPosts(true);
                const response = await api.get('/admin/listAllPosts', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPosts(response.data.posts);
            } catch (error) {
                console.error('Erro ao carregar posts:', error);
            } finally {
                setLoadingPosts(false);
            }
        };

        const fetchPolygons = async () => {
            try {
                setLoadingPolygons(true);
                const response = await api.get('/admin/polygons', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPolygons(response.data.polygons);
            } catch (error) {
                console.error('Erro ao carregar polígonos:', error);
            } finally {
                setLoadingPolygons(false);
            }
        };

        fetchPosts();
        fetchPolygons();
    }, [token]);

    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        if (drawing && event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            setCurrentPolygon([...currentPolygon, { lat, lng }]);
        }
    };

    const savePolygon = async () => {
        if (currentPolygon.length < 3) {
            alert('Um polígono deve ter pelo menos 3 pontos.');
            return;
        }
        try {
            const name = prompt('Digite o nome do polígono:');
            const notes = prompt('Digite observações (opcional):');
            const points = currentPolygon.map((point) => ({ lat: point.lat, lng: point.lng }));
            await api.post(
                '/admin/polygons/create',
                { name, points, notes },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCurrentPolygon([]);
            setDrawing(false);
            const response = await api.get('/admin/polygons', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPolygons(response.data.polygons);
        } catch (error) {
            console.error('Erro ao salvar polígono:', error);
        }
    };

    const deletePolygonHandler = async (polygonId: string) => {
        if (window.confirm('Deseja excluir este polígono?')) {
            try {
                await api.delete(`/admin/polygons/${polygonId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPolygons(polygons.filter((p) => p.id !== polygonId));
            } catch (error) {
                console.error('Erro ao excluir polígono:', error);
            }
        }
    };

    const saveMapAsImage = () => {
        if (mapRef.current) {
            const mapDiv = document.querySelector('.gm-style') as HTMLElement;
            if (mapDiv) {
                html2canvas(mapDiv).then((canvas) => {
                    const link = document.createElement('a');
                    link.download = 'mapa.png';
                    link.href = canvas.toDataURL();
                    link.click();
                });
            }
        }
    };

    const filteredPosts = posts.filter((post) => {
        if (filter === 'Todos') return true;
        if (filter === 'Interação' && post.ranking === 'Urgente') return true;
        if (filter === 'Incidente' && post.ranking === 'Mediano') return true;
        if (filter === 'Exemplo' && post.ranking === 'Baixo') return true;
        return false;
    });

    const onMapLoad = (map: google.maps.Map) => {
        mapRef.current = map;
    };

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
                        <LoadScript
                            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
                            loadingElement={<MapLoader />}
                        >
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={center}
                                zoom={13}
                                onClick={handleMapClick}
                                onLoad={onMapLoad}
                            >
                                {filteredPosts.map(
                                    (post) =>
                                        post.latitude &&
                                        post.longitude && (
                                            <Marker
                                                key={post.id}
                                                position={{ lat: post.latitude, lng: post.longitude }}
                                                title={post.title}
                                            />
                                        )
                                )}
                                {polygons.map((polygon) => (
                                    <GooglePolygon
                                        key={polygon.id}
                                        paths={polygon.points}
                                        options={{
                                            fillColor: 'lightblue',
                                            fillOpacity: 0.5,
                                            strokeColor: 'blue',
                                            strokeWeight: 2,
                                        }}
                                    />
                                ))}
                                {drawing && currentPolygon.length > 0 && (
                                    <GooglePolygon
                                        paths={currentPolygon}
                                        options={{
                                            fillColor: 'yellow',
                                            fillOpacity: 0.5,
                                            strokeColor: 'red',
                                            strokeWeight: 2,
                                        }}
                                    />
                                )}
                            </GoogleMap>
                        </LoadScript>
                    )}
                </div>
                <div className="w-1/4 bg-blue-100 p-4 overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">Polígonos Salvos</h2>
                    <ul className="space-y-2">
                        {polygons.map((polygon) => (
                            <li key={polygon.id} className="flex justify-between items-center">
                                <span>{polygon.name}</span>
                                <button
                                    onClick={() => deletePolygonHandler(polygon.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Excluir
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => setDrawing(!drawing)}
                        className={`mt-4 w-full px-4 py-2 rounded text-white ${
                            drawing ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'
                        }`}
                    >
                        {drawing ? 'Parar de Desenhar' : 'Gerenciar Locais'}
                    </button>
                    {drawing && (
                        <button
                            onClick={savePolygon}
                            className="mt-2 w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Salvar Polígono
                        </button>
                    )}
                </div>
            </div>
            <footer className="bg-gray-100 p-4 flex justify-between items-center">
                <div className="flex space-x-2">
                    {['Todos', 'Interação', 'Incidente', 'Exemplo'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded ${
                                filter === f ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <button
                    onClick={saveMapAsImage}
                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                >
                    Salvar Mapa como Imagem
                </button>
            </footer>
        </div>
    );
};

export default PolygonManagement;