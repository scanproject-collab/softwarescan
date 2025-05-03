/**
 * Calcula a distância entre dois pontos com coordenadas geográficas
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distância em km
};

/**
 * Obtém o ícone do marcador com base na tag
 */
export const getMarkerIcon = (tag: string): string => {
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

/**
 * Obtém as cores do polígono com base no peso
 */
export const getPolygonColor = (weight: string) => {
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

/**
 * Formata uma data para o formato brasileiro
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}; 