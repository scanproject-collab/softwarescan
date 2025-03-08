import axios from 'axios';

// URL da API de Geocodificação do Google Maps
const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

// Sua chave da API do Google Maps
const GOOGLE_API_KEY = 'AIzaSyBEObd5ylKvfPsZRH2FEze6-lwAeYqL90s';

/**
 * Função para geocodificar um endereço e retornar as coordenadas (latitude e longitude)
 * @param address Endereço a ser geocodificado (ex.: "Rua Augusta, São Paulo")
 * @returns Objeto com latitude e longitude
 */
export const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number }> => {
    try {
        const response = await axios.get(GOOGLE_GEOCODE_URL, {
            params: {
                address: address, // Endereço a ser geocodificado
                key: GOOGLE_API_KEY, // Sua chave da API
            },
        });

        const result = response.data.results[0];
        if (!result) {
            throw new Error('Endereço não encontrado');
        }

        return {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
        };
    } catch (error) {
        console.error('Erro ao geocodificar endereço:', error);
        throw new Error('Falha ao geocodificar o endereço. Tente novamente ou selecione manualmente no mapa.');
    }
};
