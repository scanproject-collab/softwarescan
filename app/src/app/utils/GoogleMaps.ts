import axios from 'axios';

const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const GOOGLE_API_KEY = "AIzaSyCfLlShC9EMKLBOlmjCJcxivCeUrvfUinE";

export const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number }> => {
  try {
    console.log('Geocodificando endereço:', address);
    console.log('Usando GOOGLE_API_KEY:', GOOGLE_API_KEY);
    const response = await axios.get(GOOGLE_GEOCODE_URL, {
      params: {
        address: address,
        key: GOOGLE_API_KEY,
        region: 'br',
      },
    });

    console.log('Resposta da API:', response.data);

    if (response.data.status !== 'OK') {
      throw new Error(`Erro na API de Geocodificação: ${response.data.status}`);
    }

    const result = response.data.results[0];
    if (!result) {
      throw new Error('Endereço não encontrado');
    }

    const { lat, lng } = result.geometry.location;
    console.log('Coordenadas encontradas:', { latitude: lat, longitude: lng });

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
    console.log('Fazendo reverse geocoding para:', { latitude, longitude });
    console.log('Usando GOOGLE_API_KEY:', GOOGLE_API_KEY);
    const response = await axios.get(GOOGLE_GEOCODE_URL, {
      params: {
        latlng: `${latitude},${longitude}`,
        key: GOOGLE_API_KEY,
        region: 'br',
      },
    });

    console.log('Resposta da API (reverse geocoding):', response.data);

    if (response.data.status !== 'OK') {
      throw new Error(`Erro na API de Reverse Geocoding: ${response.data.status}`);
    }

    const result = response.data.results[0];
    if (!result) {
      throw new Error('Endereço não encontrado para essas coordenadas');
    }

    const address = result.formatted_address;
    console.log('Endereço encontrado:', address);
    return address;
  } catch (error) {
    console.error('Erro ao fazer reverse geocoding:', error);
    throw new Error('Falha ao obter o endereço. Tente novamente.');
  }
};

export const getPlaceSuggestions = async (input: string): Promise<string[]> => {
  try {
    console.log('Buscando sugestões para:', input);
    console.log('Usando GOOGLE_API_KEY:', GOOGLE_API_KEY);
    const response = await axios.get(GOOGLE_PLACES_URL, {
      params: {
        input: input,
        key: GOOGLE_API_KEY,
        region: 'br',
        types: 'geocode',
        language: 'pt-BR',
      },
    });

    console.log('Resposta da Places API:', response.data);

    if (response.data.status !== 'OK') {
      throw new Error(`Erro na Places API: ${response.data.status}`);
    }

    return response.data.predictions.map((prediction: any) => prediction.description);
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error);
    return [];
  }
};