import React from 'react';
import { Loader } from 'lucide-react';

const MapLoader: React.FC = () => (
  <div className="flex justify-center items-center h-full">
    <Loader className="animate-spin h-8 w-8 text-blue-500" />
    <span className="ml-2 text-blue-500">Carregando mapa...</span>
  </div>
);

export default MapLoader; 