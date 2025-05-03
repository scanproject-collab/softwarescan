import React, { useEffect, useState } from 'react';
import { useInstitutions } from '../../features/institutions/hooks/useInstitutions';
import { InstitutionDialog } from '../../features/institutions/components/InstitutionDialog';
import Navbar from '../../features/common/components/Navbar';
import { Institution } from '../../features/institutions/types/institutions';

/**
 * Página de gerenciamento de instituições
 */
const InstitutionManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentInstitution, setCurrentInstitution] = useState<Institution | undefined>(undefined);

  const {
    institutions,
    loading,
    fetchInstitutions,
    createInstitution,
    updateInstitution,
    deleteInstitution,
    searchTerm,
    setSearchTerm,
    getSortedInstitutions
  } = useInstitutions();

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  const handleCreateInstitution = (title: string) => {
    createInstitution({ title });
    setIsCreateDialogOpen(false);
  };

  const handleEditInstitution = (title: string) => {
    if (currentInstitution) {
      updateInstitution(currentInstitution.id, { title });
      setIsEditDialogOpen(false);
      setCurrentInstitution(undefined);
    }
  };

  const handleDeleteInstitution = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta instituição?')) {
      await deleteInstitution(id);
    }
  };

  const openEditDialog = (institution: Institution) => {
    setCurrentInstitution(institution);
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const sortedInstitutions = getSortedInstitutions();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Instituições</h1>
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-md bg-orange-400 px-4 py-2 font-bold text-white hover:bg-orange-500"
          >
            Nova Instituição
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar instituições..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-300"
          />
        </div>

        {loading ? (
          <div className="text-center">
            <p className="text-gray-500">Carregando instituições...</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white shadow-md">
            {sortedInstitutions.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">Nenhuma instituição encontrada.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Usuários
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
                  {sortedInstitutions.map((institution) => (
                    <tr key={institution.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {institution.title}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {institution.userCount}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {formatDate(institution.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        <button
                          onClick={() => openEditDialog(institution)}
                          className="mr-2 text-blue-600 hover:text-blue-800"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteInstitution(institution.id)}
                          className="text-red-600 hover:text-red-800"
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
        )}
      </div>

      <InstitutionDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateInstitution}
        dialogTitle="Nova Instituição"
        dialogDescription="Adicione uma nova instituição ao sistema."
        submitButtonText="Criar"
      />

      <InstitutionDialog
        institution={currentInstitution}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setCurrentInstitution(undefined);
        }}
        onSubmit={handleEditInstitution}
        dialogTitle="Editar Instituição"
        dialogDescription="Modifique os dados da instituição."
        submitButtonText="Salvar"
      />
    </div>
  );
};

export default InstitutionManagement;