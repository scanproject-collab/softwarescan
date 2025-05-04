import React from 'react';
import { Trash2, MapPin, Info, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Polygon {
  id: string;
  name: string;
  notes?: string;
  createdAt?: string;
  author?: {
    name?: string;
  };
  points: { lat: number; lng: number }[];
}

interface PolygonListProps {
  polygons: Polygon[];
  deletePolygonHandler: (polygonId: string) => Promise<void>;
  onCenterPolygon?: (polygon: Polygon) => void;
}

const PolygonList: React.FC<PolygonListProps> = ({
  polygons,
  deletePolygonHandler,
  onCenterPolygon
}) => {
  const [expandedPolygon, setExpandedPolygon] = React.useState<string | null>(null);

  // Formatar data para exibição
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data desconhecida';
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const toggleExpand = (polygonId: string) => {
    if (expandedPolygon === polygonId) {
      setExpandedPolygon(null);
    } else {
      setExpandedPolygon(polygonId);
    }
  };

  if (polygons.length === 0) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg text-center text-sm text-gray-600">
        <p>Nenhum polígono encontrado</p>
        <p className="mt-1 text-xs">Use as ferramentas de desenho para criar polígonos</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-2 shadow-sm border border-blue-100">
      <h3 className="text-sm font-medium mb-2 text-blue-700">Polígonos Salvos ({polygons.length})</h3>
      <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
        {polygons.map((polygon) => (
          <li key={polygon.id} className="py-2">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="font-medium text-gray-700">{polygon.name}</span>
              </div>
              <div className="flex space-x-1">
                {onCenterPolygon && (
                  <button
                    onClick={() => onCenterPolygon(polygon)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Centralizar no mapa"
                  >
                    <MapPin size={16} />
                  </button>
                )}
                <button
                  onClick={() => toggleExpand(polygon.id)}
                  className="p-1 text-gray-500 hover:bg-gray-50 rounded"
                  title="Ver detalhes"
                >
                  <Info size={16} />
                </button>
                <button
                  onClick={() => deletePolygonHandler(polygon.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                  title="Excluir polígono"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {expandedPolygon === polygon.id && (
              <div className="mt-2 text-xs px-2 py-1 bg-gray-50 rounded">
                {polygon.notes && (
                  <p className="text-gray-700 mb-1">{polygon.notes}</p>
                )}
                <div className="flex items-center text-gray-500 mb-1">
                  <User size={12} className="mr-1" />
                  <span>{polygon.author?.name || 'Usuário desconhecido'}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Calendar size={12} className="mr-1" />
                  <span>{formatDate(polygon.createdAt)}</span>
                </div>
                <div className="mt-1 text-gray-500">
                  <span className="font-medium">Vértices:</span> {polygon.points?.length || 0}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PolygonList; 