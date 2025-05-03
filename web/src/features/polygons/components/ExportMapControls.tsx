import React from 'react';
import { Download } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '../../../components/ui/dialog';

interface ExportMapControlsProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  saveMap: (format: 'png' | 'jpg' | 'pdf') => void;
}

const ExportMapControls: React.FC<ExportMapControlsProps> = ({
  isModalOpen,
  setIsModalOpen,
  saveMap
}) => {
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
          Salvar mapa como imagem
        </button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogTitle className="text-xl font-semibold text-gray-800">
          Escolha o formato de download
        </DialogTitle>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <button
            onClick={() => saveMap('png')}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Download className="w-5 h-5" />
            <span>PNG</span>
          </button>
          <button
            onClick={() => saveMap('jpg')}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white py-3 px-4 rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <Download className="w-5 h-5" />
            <span>JPG</span>
          </button>
          <button
            onClick={() => saveMap('pdf')}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg shadow-md hover:from-red-600 hover:to-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <Download className="w-5 h-5" />
            <span>PDF</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportMapControls; 