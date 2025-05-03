import axios from 'axios';
import { LoadScriptProps } from '@react-google-maps/api';

const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Configurações para o carregamento da API Google Maps
export const googleMapsConfig: LoadScriptProps = {
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geometry', 'drawing'],
    language: 'pt-BR',
    region: 'BR',
};

// Opções padrão para o mapa
export const defaultMapOptions = {
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
    mapTypeId: 'roadmap' as google.maps.MapTypeId,
    mapTypeControlOptions: {
        style: 2, // DROPDOWN_MENU
        position: 3, // RIGHT_TOP
    },
};

export const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number }> => {
    try {
        const response = await axios.get(GOOGLE_GEOCODE_URL, {
            params: {
                address,
                key: GOOGLE_API_KEY,
                region: 'br', // Focar no Brasil
            },
        });

        if (response.data.status !== 'OK') {
            throw new Error(`Erro na API de Geocodificação: ${response.data.status}`);
        }

        const result = response.data.results[0];
        if (!result) {
            throw new Error('Endereço não encontrado');
        }

        const { lat, lng } = result.geometry.location;

        return {
            latitude: lat,
            longitude: lng,
        };
    } catch (error) {
        console.error('Erro ao geocodificar endereço:', error);
        throw new Error('Falha ao geocodificar o endereço. Tente novamente ou selecione manualmente no mapa.');
    }
};

export const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
        const response = await axios.get(GOOGLE_GEOCODE_URL, {
            params: {
                latlng: `${latitude},${longitude}`,
                key: GOOGLE_API_KEY,
                region: 'br', // Focar no Brasil
            },
        });

        if (response.data.status !== 'OK') {
            throw new Error(`Erro na API de Reverse Geocoding: ${response.data.status}`);
        }

        const result = response.data.results[0];
        if (!result) {
            throw new Error('Endereço não encontrado para essas coordenadas');
        }

        const address = result.formatted_address;
        return address;
    } catch (error) {
        console.error('Erro ao fazer reverse geocoding:', error);
        throw new Error('Falha ao obter o endereço. Tente novamente.');
    }
};

export const getPlaceSuggestions = async (input: string): Promise<string[]> => {
    try {
        const response = await axios.get(GOOGLE_PLACES_URL, {
            params: {
                input,
                key: GOOGLE_API_KEY,
                region: 'br', // Focar no Brasil
                types: 'geocode', // Limitar a endereços
                language: 'pt-BR', // Resultados em português
            },
        });

        if (response.data.status !== 'OK') {
            throw new Error(`Erro na Places API: ${response.data.status}`);
        }

        return response.data.predictions.map((prediction: any) => prediction.description);
    } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        return [];
    }
};

// Converte polygon do formato do Leaflet para o formato Google Maps
export const leafletToGooglePolygon = (coordinates: [number, number][]) => {
    return coordinates.map(point => ({
        lat: point[0],
        lng: point[1],
    }));
};

// Converte polygon do formato Google Maps para o formato Leaflet
export const googleToLeafletPolygon = (coordinates: google.maps.LatLngLiteral[]) => {
    return coordinates.map(point => [point.lat, point.lng] as [number, number]);
};

// Calcula a área de um polígono em metros quadrados
export const calculatePolygonArea = (path: google.maps.LatLngLiteral[]) => {
    if (!window.google || !window.google.maps) {
        console.error('Google Maps não está carregado');
        return 0;
    }

    if (path.length < 3) {
        return 0;
    }

    const googlePolygon = new google.maps.Polygon({ paths: path });
    const area = google.maps.geometry.spherical.computeArea(googlePolygon.getPath());
    return area;
};