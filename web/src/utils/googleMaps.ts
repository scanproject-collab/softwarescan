import axios from "axios";

const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCfLlShC9EMKLBOlmjCJcxivCeUrvfUinE';

export const getPlaceSuggestions = async (input: string): Promise<string[]> => {
    try {
        const response = await axios.get(GOOGLE_PLACES_URL, {
            params: {
                input: input,
                key: GOOGLE_API_KEY,
                region: 'br',
                types: 'geocode',
                language: 'pt-BR',
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

export const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number }> => {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                key: GOOGLE_API_KEY,
                region: 'br',
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
        return { latitude: lat, longitude: lng };
    } catch (error) {
        console.error('Erro ao geocodificar endereço:', error);
        throw new Error('Falha ao geocodificar o endereço.');
    }
};