import React from 'react';
import { Info } from 'lucide-react';

interface DrawingGuideProps {
  isVisible: boolean;
  onToggle: () => void;
}

const DrawingGuide: React.FC<DrawingGuideProps> = ({ isVisible, onToggle }) => {
  return (
    <div className="mt-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-center gap-2 bg-blue-100 text-blue-700 border border-blue-300 px-4 py-2 rounded-lg hover:bg-blue-200"
      >
        <Info className="h-4 w-4" />
        <span>Como desenhar?</span>
      </button>

      {isVisible && (
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
          <p className="mt-1 text-blue-600 text-xs">Dica: Use as formas pré-definidas para criar polígonos rapidamente!</p>
        </div>
      )}
    </div>
  );
};

export default DrawingGuide; 