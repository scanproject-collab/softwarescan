import React from 'react';
import { X, Check, Info } from 'lucide-react';

interface PolygonDrawingGuideProps {
  isDrawing: boolean;
  currentPolygon: any[];
  handleCancelDrawing: () => void;
  savePolygon: () => void;
  drawingGuideVisible: boolean;
  toggleDrawingGuide: () => void;
}

const PolygonDrawingGuide: React.FC<PolygonDrawingGuideProps> = ({
  isDrawing,
  currentPolygon,
  handleCancelDrawing,
  savePolygon,
  drawingGuideVisible,
  toggleDrawingGuide
}) => {
  return (
    <div className="mt-6 space-y-2">
      <button
        onClick={toggleDrawingGuide}
        className="w-full flex items-center justify-center gap-2 bg-blue-100 text-blue-700 border border-blue-300 px-4 py-2 rounded-lg hover:bg-blue-200"
      >
        <Info className="h-4 w-4" />
        <span>Como desenhar?</span>
      </button>

      {drawingGuideVisible && (
        <div className="mt-2 p-3 bg-white rounded shadow-md text-sm">
          <h3 className="font-bold text-blue-800 mb-1">Como desenhar um polígono:</h3>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Clique no botão "Desenhar Polígono"</li>
            <li>Clique em pontos no mapa para criar vértices</li>
            <li>O primeiro ponto será marcado em verde (início)</li>
            <li>Para fechar o polígono, clique próximo ao ponto inicial</li>
            <li>Preencha o nome e as informações quando solicitado</li>
          </ol>
          <p className="mt-2 text-gray-600">Um polígono deve ter pelo menos 3 pontos para ser válido.</p>
        </div>
      )}

      {isDrawing && (
        <div className="absolute top-4 left-4 z-10 bg-white p-3 rounded shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-blue-500" />
            <span className="font-semibold text-blue-800">Modo de Desenho Ativo</span>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            Clique no mapa para adicionar pontos ao polígono.
            <br />
            Clique próximo ao ponto inicial para fechar o polígono.
          </div>
          <div className="flex justify-between">
            <button
              onClick={handleCancelDrawing}
              className="flex items-center gap-1 text-sm bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
            >
              <X size={14} />
              Cancelar
            </button>
            {currentPolygon.length >= 3 && (
              <button
                onClick={savePolygon}
                className="flex items-center gap-1 text-sm bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200"
              >
                <Check size={14} />
                Concluir
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PolygonDrawingGuide; 