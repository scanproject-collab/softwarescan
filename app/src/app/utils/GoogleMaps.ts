import axios from 'axios';

const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number }> => {
  if (!address || typeof address !== 'string') {
    throw new Error('Endereço inválido');
  }

  try {
    console.log('Geocodificando endereço:', address);
    const response = await axios.get(GOOGLE_GEOCODE_URL, {
      params: {
        address: address,
        key: GOOGLE_API_KEY,
        region: 'br',
        language: 'pt-BR',
      },
      timeout: 10000, // 10 segundos timeout
    });

    if (response.data.status !== 'OK') {
      console.error('Erro na API de Geocodificação:', response.data.status);
      throw new Error(`Erro na geocodificação: ${response.data.status}`);
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
    throw new Error('Falha ao geocodificar o endereço. Verifique sua conexão ou tente novamente.');
  }
};

export const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return 'Coordenadas inválidas';
  }

  try {
    const response = await axios.get(GOOGLE_GEOCODE_URL, {
      params: {
        latlng: `${latitude},${longitude}`,
        key: GOOGLE_API_KEY,
        region: 'br',
        language: 'pt-BR',
      },
      timeout: 10000,
    });

    if (response.data.status !== 'OK') {
      console.error('Status da API:', response.data.status);
      return 'Endereço não encontrado';
    }

    return response.data.results[0]?.formatted_address || 'Endereço não disponível';
  } catch (error) {
    console.error('Erro no reverse geocoding:', error);
    return 'Erro ao obter endereço';
  }
};

export const getPlaceSuggestions = async (input: string): Promise<string[]> => {
  if (!input || input.length < 3) return [];

  try {
    const response = await axios.get(GOOGLE_PLACES_URL, {
      params: {
        input: input,
        key: GOOGLE_API_KEY,
        region: 'br',
        types: 'geocode',
        language: 'pt-BR',
      },
      timeout: 10000,
    });

    if (response.data.status !== 'OK') {
      return [];
    }

    return response.data.predictions.map((prediction: any) => prediction.description);
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error);
    return [];
  }
};