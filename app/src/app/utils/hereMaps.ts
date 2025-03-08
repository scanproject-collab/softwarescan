import axios from 'axios';

// URLs da API HERE Maps
const HERE_AUTH_URL = 'https://account.api.here.com/oauth2/token';
const HERE_GEOCODE_URL = 'https://geocode.search.hereapi.com/v1/geocode';

// Credenciais OAuth fornecidas
const ACCESS_KEY_ID = 'i1psryjp_ixG3gdKEZ9tCg';
const ACCESS_KEY_SECRET = 'AgxU0WBHk4BrE62oxi2a36i2gFKiAq9t88DGE98bmgkmPepR7qANzcXP5iMe6NgY92iRI2r_co8oF7-54ODxJQ';

/**
 * Função para obter um token de acesso usando o fluxo OAuth Client Credentials
 * @returns Token de acesso (string)
 */
export const getAccessToken = async (): Promise<string> => {
    const credentials = {
        client_id: ACCESS_KEY_ID,
        client_secret: ACCESS_KEY_SECRET,
        grant_type: 'client_credentials',
    };

    try {
        const response = await axios.post(HERE_AUTH_URL, null, {
            params: credentials,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (!response.data.access_token) {
            throw new Error('Token de acesso não retornado');
        }

        return response.data.access_token;
    } catch (error) {
        console.error('Erro ao obter token de acesso HERE Maps:', error);
        throw new Error('Falha ao autenticar com HERE Maps');
    }
};

/**
 * Função para geocodificar um endereço e retornar as coordenadas (latitude e longitude)
 * @param address Endereço a ser geocodificado (ex.: "Rua Augusta, São Paulo")
 * @returns Objeto com latitude e longitude
 */
export const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number }> => {
    try {
        const accessToken = await getAccessToken();

        const response = await axios.get(HERE_GEOCODE_URL, {
            params: {
                q: address, // Query do endereço
                lang: 'pt-BR', // Idioma da resposta
            },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const result = response.data.items[0];
        if (!result) {
            throw new Error('Endereço não encontrado');
        }

        return {
            latitude: result.position.lat,
            longitude: result.position.lng,
        };
    } catch (error) {
        console.error('Erro ao geocodificar endereço:', error);
        throw new Error('Falha ao geocodificar o endereço. Tente novamente ou selecione manualmente no mapa.');
    }
};