import React from 'react';
import { Square, Circle, Triangle, Hexagon, MousePointer, Move } from 'lucide-react';

interface PredefinedShapesProps {
  onSelectShape: (shape: 'rectangle' | 'circle' | 'triangle' | 'hexagon') => void;
}

const PredefinedShapes: React.FC<PredefinedShapesProps> = ({ onSelectShape }) => {
  return (
    <div className="bg-white p-3 rounded-lg shadow-md">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Formas Predefinidas</h3>

      <div className="flex items-center mb-3 p-2 bg-blue-50 rounded-md">
        <MousePointer className="h-4 w-4 text-blue-500 mr-2" />
        <span className="text-xs text-blue-600">
          Selecione uma forma e depois clique no mapa para posicioná-la
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onSelectShape('rectangle')}
          className="flex flex-col items-center p-2 bg-blue-50 hover:bg-blue-100 rounded-md transition"
        >
          <Square className="h-8 w-8 text-blue-600 mb-1" />
          <span className="text-xs text-blue-700">Retângulo</span>
        </button>
        <button
          onClick={() => onSelectShape('circle')}
          className="flex flex-col items-center p-2 bg-blue-50 hover:bg-blue-100 rounded-md transition"
        >
          <Circle className="h-8 w-8 text-blue-600 mb-1" />
          <span className="text-xs text-blue-700">Círculo</span>
        </button>
        <button
          onClick={() => onSelectShape('triangle')}
          className="flex flex-col items-center p-2 bg-blue-50 hover:bg-blue-100 rounded-md transition"
        >
          <Triangle className="h-8 w-8 text-blue-600 mb-1" />
          <span className="text-xs text-blue-700">Triângulo</span>
        </button>
        <button
          onClick={() => onSelectShape('hexagon')}
          className="flex flex-col items-center p-2 bg-blue-50 hover:bg-blue-100 rounded-md transition"
        >
          <Hexagon className="h-8 w-8 text-blue-600 mb-1" />
          <span className="text-xs text-blue-700">Hexágono</span>
        </button>
      </div>

      <div className="mt-3 p-2 bg-green-50 rounded-md flex items-start">
        <Move className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
        <span className="text-xs text-green-700">
          As formas são editáveis. Arraste os vértices para ajustar ou mova a forma completa.
        </span>
      </div>
    </div>
  );
};

export default PredefinedShapes; 