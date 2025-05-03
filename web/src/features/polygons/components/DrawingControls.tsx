import React from 'react';
import { Pencil, X, Check } from 'lucide-react';

interface DrawingControlsProps {
  drawing: boolean;
  setDrawing: (drawing: boolean) => void;
  showHeatmap: boolean;
  setShowHeatmap: (show: boolean) => void;
}

const DrawingControls: React.FC<DrawingControlsProps> = ({
  drawing,
  setDrawing,
  showHeatmap,
  setShowHeatmap
}) => {
  return (
    <div className="space-y-2">
      <button
        onClick={() => setDrawing(!drawing)}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white ${drawing ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          }`}
      >
        {drawing ? (
          <>
            <X className="h-5 w-5" />
            <span>Parar de Desenhar</span>
          </>
        ) : (
          <>
            <Pencil className="h-5 w-5" />
            <span>Desenhar Polígono</span>
          </>
        )}
      </button>

      <button
        onClick={() => setShowHeatmap(!showHeatmap)}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white ${showHeatmap ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
      >
        {showHeatmap ? (
          <>
            <X className="h-5 w-5" />
            <span>Desativar Heatmap</span>
          </>
        ) : (
          <>
            <Check className="h-5 w-5" />
            <span>Ativar Heatmap</span>
          </>
        )}
      </button>
    </div>
  );
};

export default DrawingControls; 