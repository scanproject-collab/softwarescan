import React from 'react';
import { X } from 'lucide-react';

interface FilterControlsProps {
  filterDateStart: string;
  setFilterDateStart: (date: string) => void;
  filterDateEnd: string;
  setFilterDateEnd: (date: string) => void;
  filterTag: string;
  setFilterTag: (tag: string) => void;
  tags: string[];
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  postLocations: string[];
  clearDateFilters: () => void;
  clearAllFilters: () => void;
  formatDate: (date: string) => string;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filterDateStart,
  setFilterDateStart,
  filterDateEnd,
  setFilterDateEnd,
  filterTag,
  setFilterTag,
  tags,
  selectedLocation,
  setSelectedLocation,
  postLocations,
  clearDateFilters,
  clearAllFilters,
  formatDate
}) => {
  return (
    <>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Gerenciar Locais</label>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
        >
          <option value="">Todas as Localizações</option>
          {postLocations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      <div className="flex space-x-2">
        <div className="flex flex-col">
          <label htmlFor="date-start" className="text-sm font-medium text-gray-700 mb-1">
            Data de início
          </label>
          <div className="relative">
            <input
              id="date-start"
              type="date"
              value={filterDateStart}
              onChange={(e) => setFilterDateStart(e.target.value)}
              className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              aria-label="Filtrar postagens a partir desta data"
              title="Selecione a data inicial para filtrar posts"
            />
            {filterDateStart && (
              <button
                onClick={() => setFilterDateStart('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Limpar data inicial"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <label htmlFor="date-end" className="text-sm font-medium text-gray-700 mb-1">
            Data de fim
          </label>
          <div className="relative">
            <input
              id="date-end"
              type="date"
              value={filterDateEnd}
              onChange={(e) => setFilterDateEnd(e.target.value)}
              className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              aria-label="Filtrar postagens até esta data"
              title="Selecione a data final para filtrar posts"
            />
            {filterDateEnd && (
              <button
                onClick={() => setFilterDateEnd('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Limpar data final"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <label htmlFor="tag-filter" className="text-sm font-medium text-gray-700 mb-1">
            Filtrar por Tag
          </label>
          <select
            id="tag-filter"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filtrar postagens por tag"
          >
            <option value="">Todas as Tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(filterDateStart || filterDateEnd || filterTag || selectedLocation) && (
        <div className="flex items-center gap-2 mt-2">
          {(filterDateStart || filterDateEnd) && (
            <div className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
              <span>Período: </span>
              {filterDateStart && <span>{formatDate(filterDateStart)}</span>}
              {filterDateStart && filterDateEnd && <span> até </span>}
              {filterDateEnd && <span>{formatDate(filterDateEnd)}</span>}
              <button
                onClick={clearDateFilters}
                className="ml-1 text-red-500 hover:text-red-700"
                title="Limpar filtro de data"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <button
            onClick={clearAllFilters}
            className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
            title="Limpar todos os filtros"
          >
            Limpar todos
          </button>
        </div>
      )}
    </>
  );
};

export default FilterControls; 