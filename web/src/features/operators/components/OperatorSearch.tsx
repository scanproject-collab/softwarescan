import React from 'react';
import { Search, Plus } from 'lucide-react';

interface Institution {
  id: string;
  title: string;
}

interface OperatorSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedInstitution: string;
  setSelectedInstitution: (id: string) => void;
  institutions: Institution[];
  handleSearch: () => void;
  isAdmin: boolean;
  onAddOperator: () => void;
}

const OperatorSearch: React.FC<OperatorSearchProps> = ({
  searchQuery,
  setSearchQuery,
  selectedInstitution,
  setSelectedInstitution,
  institutions,
  handleSearch,
  isAdmin,
  onAddOperator
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-grow">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar Operadores
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome ou email do operador..."
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>

        {isAdmin && (
          <div className="md:w-1/3">
            <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
              Instituição
            </label>
            <select
              id="institution"
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as Instituições</option>
              {institutions.map((institution) => (
                <option key={institution.id} value={institution.id}>
                  {institution.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150 flex items-center"
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </button>

          <button
            onClick={onAddOperator}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-150 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Operador
          </button>
        </div>
      </div>
    </div>
  );
};

export default OperatorSearch; 