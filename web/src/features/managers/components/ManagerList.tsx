import React from 'react';
import { Manager } from '../types/managers';
import { Institution } from '../../institutions/types/institutions';
import { UserCircle, Clock, Building } from 'lucide-react';

interface ManagerListProps {
  managers: Manager[];
  institutions: Institution[];
  onUpdateInstitution: (managerId: string, institutionId: string) => void;
  onDelete: (managerId: string) => void;
}

/**
 * Exibe a lista de gerentes
 */
const ManagerList: React.FC<ManagerListProps> = ({
  managers,
  institutions,
  onUpdateInstitution,
  onDelete
}) => {
  // Função para formatar a data
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Nunca';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  // Função para obter a classe CSS de status baseada na última atividade
  const getStatusClass = (lastLoginDate: string | undefined) => {
    if (!lastLoginDate) return 'bg-gray-300';

    const date = new Date(lastLoginDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'bg-green-500';
    if (diffDays < 7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="overflow-x-auto">
      {managers.length === 0 ? (
        <div className="rounded-lg bg-white p-6 text-center text-gray-500">
          Nenhum gerente encontrado.
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                Gerente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                Instituição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                Último Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {managers.map((manager) => (
              <tr key={manager.id} className="hover:bg-gray-50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <UserCircle className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{manager.name || 'Sem nome'}</div>
                      <div className="text-sm text-gray-500">{manager.email}</div>
                    </div>
                    <span className={`ml-2 h-3 w-3 rounded-full ${getStatusClass(manager.lastLoginDate)}`}
                      title={manager.lastLoginDate ? `Último login: ${new Date(manager.lastLoginDate).toLocaleString('pt-BR')}` : 'Nunca fez login'}></span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    <select
                      value={manager.institution?.id || ''}
                      onChange={(e) => onUpdateInstitution(manager.id, e.target.value)}
                      className="rounded-md border border-gray-300 p-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Sem instituição</option>
                      {institutions.map((institution) => (
                        <option key={institution.id} value={institution.id}>
                          {institution.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span>
                      {formatDate(manager.lastLoginDate)}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => onDelete(manager.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManagerList; 