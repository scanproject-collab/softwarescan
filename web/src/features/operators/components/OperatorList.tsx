import React from 'react';
import { Operator } from '../types/operator.types';

interface OperatorListProps {
  operators: Operator[];
  selectedOperatorId: string | null;
  onSelectOperator: (operatorId: string) => void;
  isOperatorActive: (operator: Operator) => boolean;
}

const OperatorList: React.FC<OperatorListProps> = ({
  operators,
  selectedOperatorId,
  onSelectOperator,
  isOperatorActive
}) => {
  if (operators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-gray-300 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <p>Nenhum operador encontrado.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {operators.map((operator) => {
        const isActive = isOperatorActive(operator);
        return (
          <li
            key={operator.id}
            className={`py-3 px-2 cursor-pointer transition-colors duration-150 rounded-md ${selectedOperatorId === operator.id
                ? 'bg-blue-50 border-l-4 border-blue-500'
                : 'hover:bg-gray-50'
              }`}
            onClick={() => onSelectOperator(operator.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{operator.name}</p>
                <p className="text-sm text-gray-500 flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-gray-200 mr-1"></span>
                  {operator.email}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {typeof operator.institution === 'object' && operator.institution
                    ? operator.institution.title
                    : operator.institution}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`px-2 py-1 text-xs rounded-full inline-flex items-center ${isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-1 ${isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}
                  ></span>
                  {isActive ? 'Ativo' : 'Inativo'}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {operator.postsCount} {operator.postsCount === 1 ? 'post' : 'posts'}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default OperatorList; 