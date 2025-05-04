import React, { useEffect, useState, useCallback } from 'react';
import { useManagers } from '../../features/managers/hooks/useManagers';
import { ManagerForm } from '../../features/managers/components/ManagerForm';
import ManagerList from '../../features/managers/components/ManagerList';
import Navbar from '../../features/common/components/Navbar';
import { CreateManagerDto } from '../../features/managers/types/managers';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';
import { Plus, RefreshCw, Search } from 'lucide-react';

/**
 * Página de gerenciamento de gerentes
 */
const ManagerManagement: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('');

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

  // Use this callback to ensure we don't trigger unnecessary re-renders
  const loadData = useCallback(async () => {
    await fetchData();
    setInitialLoadComplete(true);
  }, [fetchData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateManager = async (data: CreateManagerDto) => {
    const result = await createManager(data);
    if (result) {
      setShowCreateForm(false);
    }
  };

  const handleUpdateInstitution = (managerId: string, institutionId: string) => {
    updateManagerInstitution(managerId, { institutionId: institutionId || null });
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Filtrar gerentes baseado nas condições de busca
  const filteredManagers = managers.filter(manager => {
    const matchesSearchTerm =
      !searchTerm ||
      manager.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesInstitution =
      !institutionFilter ||
      manager.institution?.id === institutionFilter;

    return matchesSearchTerm && matchesInstitution;
  });

  // Only show loading on initial load, not during refreshes
  const showLoading = !initialLoadComplete && loading;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Gerentes</h1>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700 transition"
              disabled={loading}
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="rounded-md bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600 transition flex items-center gap-2"
                disabled={loading}
              >
                <Plus className="h-5 w-5" />
                Novo Gerente
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome ou email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 pl-10 p-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
            />
          </div>
          <select
            value={institutionFilter}
            onChange={(e) => setInstitutionFilter(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
          >
            <option value="">Todas as Instituições</option>
            {institutions.map((institution) => (
              <option key={institution.id} value={institution.id}>
                {institution.title}
              </option>
            ))}
          </select>
        </div>

        {showLoading ? (
          <div className="h-64">
            <LoadingSpinner size="lg" text="Carregando dados..." color="orange" />
          </div>
        ) : (
          <>
            {showCreateForm && (
              <div className="mb-6 bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <ManagerForm
                  institutions={institutions}
                  isCreating={isCreating}
                  onSubmit={handleCreateManager}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            )}

            {loading && initialLoadComplete && (
              <div className="mb-4 p-2 bg-blue-50 rounded">
                <LoadingSpinner size="sm" text="Atualizando dados..." color="blue" inline />
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ManagerList
                managers={filteredManagers}
                institutions={institutions}
                onUpdateInstitution={handleUpdateInstitution}
                onDelete={deleteManager}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManagerManagement;
