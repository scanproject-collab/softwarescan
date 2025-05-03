import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '../types/operator.types';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { page, pages, total } = pagination;

  // Se não houver mais de uma página, não exibir paginação
  if (pages <= 1) return null;

  // Calcular a faixa de páginas a exibir para não mostrar muitos botões
  const createPageRange = () => {
    const range = [];
    const delta = 2; // Número de páginas para mostrar antes e depois da atual

    for (
      let i = Math.max(1, page - delta);
      i <= Math.min(pages, page + delta);
      i++
    ) {
      range.push(i);
    }

    // Adicionar a primeira página se não estiver no range
    if (range[0] > 1) {
      if (range[0] > 2) {
        range.unshift('...');
      }
      range.unshift(1);
    }

    // Adicionar a última página se não estiver no range
    if (range[range.length - 1] < pages) {
      if (range[range.length - 1] < pages - 1) {
        range.push('...');
      }
      range.push(pages);
    }

    return range;
  };

  const pageRange = createPageRange();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{total > 0 ? (page - 1) * pagination.limit + 1 : 0}</span>{' '}
            a{' '}
            <span className="font-medium">
              {Math.min(page * pagination.limit, total)}
            </span>{' '}
            de <span className="font-medium">{total}</span> resultados
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => page > 1 && onPageChange(page - 1)}
              disabled={page === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${page === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
                }`}
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeft className="h-5 w-5" />
            </button>

            {pageRange.map((pageNumber, index) => (
              <React.Fragment key={index}>
                {pageNumber === '...' ? (
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => typeof pageNumber === 'number' && onPageChange(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pageNumber
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {pageNumber}
                  </button>
                )}
              </React.Fragment>
            ))}

            <button
              onClick={() => page < pages && onPageChange(page + 1)}
              disabled={page === pages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${page === pages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
                }`}
            >
              <span className="sr-only">Próxima</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination; 