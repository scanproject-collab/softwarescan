import React from 'react';
import { Manager } from '../types/managers';
import { Institution } from '../../institutions/types/institutions';

interface ManagerListProps {
  managers: Manager[];
  institutions: Institution[];
  onUpdateInstitution: (managerId: string, institutionId: string) => void;
  onDelete: (managerId: string) => void;
}

/**
 * Componente de lista de gerentes
 */
export const ManagerList: React.FC<ManagerListProps> = ({
  managers,
  institutions,
  onUpdateInstitution,
  onDelete,
}) => {
  /**
   * Formata data para exibição
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (managers.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Gerentes Cadastrados</h2>
        <p className="text-gray-500">Nenhum gerente cadastrado.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold text-gray-800">Gerentes Cadastrados</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Instituição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Data de Criação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {managers.map((manager) => (
              <tr key={manager.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {manager.name || "Sem nome"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {manager.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  <select
                    value={manager.institution?.id || ""}
                    onChange={(e) => onUpdateInstitution(manager.id, e.target.value)}
                    className="rounded-md border border-gray-300 p-1 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-300"
                  >
                    <option value="">Sem instituição</option>
                    {institutions.map((institution) => (
                      <option key={institution.id} value={institution.id}>
                        {institution.title}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {formatDate(manager.createdAt)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  <button
                    onClick={() => onDelete(manager.id)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 