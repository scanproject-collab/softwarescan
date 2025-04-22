import axios from 'axios';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

// Cache keys
const GEOCODE_CACHE_PREFIX = 'geocode_cache_';
const REVERSE_GEOCODE_CACHE_PREFIX = 'reverse_geocode_cache_';
const PLACES_CACHE_PREFIX = 'places_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Helper to check if cache is valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_EXPIRY;
};

export const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number }> => {
  if (!address || typeof address !== 'string') {
    throw new Error('Endereço inválido');
  }

  // Check cache first
  const cacheKey = `${GEOCODE_CACHE_PREFIX}${address.toLowerCase().trim()}`;
  try {
    const cachedData = await AsyncStorage.getItem(cacheKey);
    if (cachedData) {
      const { result, timestamp } = JSON.parse(cachedData);
      if (isCacheValid(timestamp)) {
        console.log('Usando resultados em cache para geocodificação:', address);
        return result;
      }
    }
  } catch (error) {
    console.warn('Erro ao ler cache de geocodificação:', error);
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
      timeout: 8000, // Reduced timeout for faster response
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
    const locationResult = {
      latitude: lat,
      longitude: lng,
    };

    // Cache the result
    try {
      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({
          result: locationResult,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.warn('Erro ao salvar cache de geocodificação:', error);
    }

    return locationResult;
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    throw new Error('Falha ao geocodificar o endereço. Verifique sua conexão ou tente novamente.');
  }
};

export const reverseGeocode = async (latitude: number, longitude: number, retries = 2): Promise<string> => {
  // Validação adicional para garantir que os parâmetros são números válidos
  if (latitude === undefined || longitude === undefined ||
    typeof latitude !== 'number' || typeof longitude !== 'number' ||
    isNaN(latitude) || isNaN(longitude)) {
    return 'Coordenadas inválidas';
  }

  // Verificar limites válidos para coordenadas geográficas
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return 'Coordenadas fora dos limites válidos';
  }

  try {
    // Round coordinates to 5 decimal places for better caching
    const roundedLat = Math.round(latitude * 100000) / 100000;
    const roundedLng = Math.round(longitude * 100000) / 100000;
    const cacheKey = `${REVERSE_GEOCODE_CACHE_PREFIX}${roundedLat}_${roundedLng}`;

    // Check cache first
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          if (parsedData && parsedData.result && parsedData.timestamp &&
            typeof parsedData.result === 'string' &&
            isCacheValid(parsedData.timestamp)) {
            console.log('Usando endereço em cache para coordenadas:', roundedLat, roundedLng);
            return parsedData.result;
          }
        } catch (parseError) {
          console.warn('Erro ao processar dados de cache:', parseError);
        }
      }
    } catch (cacheError) {
      console.warn('Erro ao ler cache de endereço:', cacheError);
    }

    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.warn("Sem conexão de rede para reverse geocoding.");
        return 'Sem conexão de rede. Endereço não disponível.';
      }
    } catch (netError) {
      console.warn('Erro ao verificar conexão:', netError);
      return 'Erro ao verificar conexão de rede';
    }

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        console.log(`Tentativa ${attempt + 1} de reverse geocoding para: ${roundedLat}, ${roundedLng}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
          const response = await axios.get(GOOGLE_GEOCODE_URL, {
            params: {
              latlng: `${roundedLat},${roundedLng}`,
              key: GOOGLE_API_KEY,
              region: 'br',
              language: 'pt-BR',
            },
            timeout: 8000, // Reduced timeout for faster response
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response || !response.data) {
            console.error('Resposta vazia da API');
            continue;
          }

          if (response.data.status !== 'OK') {
            console.error('Status da API:', response.data.status);
            if (attempt === retries - 1) {
              return 'Endereço não encontrado';
            }
            continue;
          }

          let result = 'Endereço não disponível';

          if (response.data.results &&
            Array.isArray(response.data.results) &&
            response.data.results.length > 0 &&
            response.data.results[0] &&
            response.data.results[0].formatted_address) {
            result = response.data.results[0].formatted_address;
          }

          // Cache the result
          try {
            await AsyncStorage.setItem(
              cacheKey,
              JSON.stringify({
                result,
                timestamp: Date.now(),
              })
            );
          } catch (storageError) {
            console.warn('Erro ao salvar cache de endereço:', storageError);
          }

          return result;
        } catch (requestError) {
          clearTimeout(timeoutId);
          console.error(`Erro no request de geocoding (tentativa ${attempt + 1}):`, requestError);

          if (attempt === retries - 1) {
            if (requestError.message && requestError.message.includes('Network Error')) {
              return 'Erro de rede ao obter endereço. Verifique sua conexão.';
            }
            return 'Erro ao obter endereço';
          }

          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (attemptError) {
        console.error(`Erro na tentativa ${attempt + 1} de reverse geocoding:`, attemptError);
        if (attempt === retries - 1) {
          return 'Erro ao processar dados de localização';
        }
      }
    }

    return 'Erro ao obter endereço após múltiplas tentativas';
  } catch (outerError) {
    console.error('Erro global na função reverseGeocode:', outerError);
    return 'Erro no serviço de localização';
  }
};

export const getPlaceSuggestions = async (input: string): Promise<string[]> => {
  if (!input || input.length < 3) return [];

  // Check cache first
  const cacheKey = `${PLACES_CACHE_PREFIX}${input.toLowerCase().trim()}`;
  try {
    const cachedData = await AsyncStorage.getItem(cacheKey);
    if (cachedData) {
      const { result, timestamp } = JSON.parse(cachedData);
      // Use a shorter expiry for place suggestions (1 hour)
      if (Date.now() - timestamp < 60 * 60 * 1000) {
        console.log('Usando sugestões em cache para:', input);
        return result;
      }
    }
  } catch (error) {
    console.warn('Erro ao ler cache de sugestões:', error);
  }

  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    console.warn("Sem conexão de rede para buscar sugestões.");
    return [];
  }

  try {
    const response = await axios.get(GOOGLE_PLACES_URL, {
      params: {
        input: input,
        key: GOOGLE_API_KEY,
        region: 'br',
        types: 'geocode',
        language: 'pt-BR',
      },
      timeout: 8000, // Reduced timeout for faster response
    });

    if (response.data.status !== 'OK') {
      return [];
    }

    const result = response.data.predictions.map((prediction: any) => prediction.description);

    // Cache the result
    try {
      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({
          result,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.warn('Erro ao salvar cache de sugestões:', error);
    }

    return result;
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error);
    return [];
  }
};