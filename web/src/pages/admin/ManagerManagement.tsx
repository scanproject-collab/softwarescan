import React, { useEffect, useState } from 'react';
import { useManagers } from '../../features/managers/hooks/useManagers';
import { ManagerForm } from '../../features/managers/components/ManagerForm';
import { ManagerList } from '../../features/managers/components/ManagerList';
import Navbar from '../../features/common/components/Navbar';
import { CreateManagerDto } from '../../features/managers/types/managers';

/**
 * Página de gerenciamento de gerentes
 */
const ManagerManagement: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    managers,
    institutions,
    loading,
    isCreating,
    fetchData,
    createManager,
    updateManagerInstitution,
    deleteManager
  } = useManagers();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateManager = async (data: CreateManagerDto) => {
    const result = await createManager(data);
    if (result) {
      setShowCreateForm(false);
    }
  };

  const handleUpdateInstitution = (managerId: string, institutionId: string) => {
    updateManagerInstitution(managerId, { institutionId: institutionId || null });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Gerentes</h1>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="rounded-md bg-orange-400 px-4 py-2 font-bold text-white hover:bg-orange-500"
            >
              Novo Gerente
            </button>
          )}
        </div>

        {loading && !showCreateForm ? (
          <div className="text-center">
            <p className="text-gray-500">Carregando dados...</p>
          </div>
        ) : (
          <>
            {showCreateForm && (
              <ManagerForm
                institutions={institutions}
                isCreating={isCreating}
                onSubmit={handleCreateManager}
                onCancel={() => setShowCreateForm(false)}
              />
            )}

            <ManagerList
              managers={managers}
              institutions={institutions}
              onUpdateInstitution={handleUpdateInstitution}
              onDelete={deleteManager}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ManagerManagement;
