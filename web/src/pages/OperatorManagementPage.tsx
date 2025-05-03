import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../shared/services/api';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent } from '../components/ui/dialog';

// Layout
import MainLayout from '../layouts/MainLayout';

// Componentes
import OperatorList from '../features/operators/components/OperatorList';
import OperatorDetails from '../features/operators/components/OperatorDetails';
import OperatorForm from '../features/operators/components/OperatorForm';
import OperatorSearch from '../features/operators/components/OperatorSearch';
import Pagination from '../features/operators/components/Pagination';

// Hooks
import { useOperators } from '../features/operators/hooks/useOperators';
import { Operator, FormData, FilterParams } from '../features/operators/types/operator.types';

const OperatorManagementPage: React.FC = () => {
  const { user } = useAuth();
  const {
    operators,
    selectedOperator,
    loading,
    pagination,
    fetchOperators,
    fetchOperatorDetails,
    updateOperator,
    deleteOperator,
    setSelectedOperator
  } = useOperators();

  // Estados para instituições (apenas para admin)
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);

  // Estados para pesquisa e filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');

  // Estados para edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddOperatorModalOpen, setIsAddOperatorModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    isActive: true
  });

  // Carregar instituições para admin
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      const fetchInstitutions = async () => {
        try {
          setLoadingInstitutions(true);
          const response = await api.get('/institutions', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setInstitutions(response.data.institutions || []);
        } catch (error) {
          console.error('Erro ao buscar instituições:', error);
          toast.error('Não foi possível carregar a lista de instituições.');
        } finally {
          setLoadingInstitutions(false);
        }
      };
      fetchInstitutions();
    }
  }, [user]);

  // Buscar operadores ao iniciar
  useEffect(() => {
    const params: FilterParams = {
      page: 1,
      limit: 10
    };
    fetchOperators(params);
  }, [fetchOperators]);

  // Verificar se o operador está ativo
  const isOperatorActive = useCallback((operator: Operator) => {
    return operator.isActive === true;
  }, []);

  // Formatar data
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }, []);

  // Obter tags de um post
  const getPostTags = useCallback((post: any) => {
    if (!post.tags || post.tags.length === 0) return 'Sem tags';

    return post.tags
      .map((tag: any) => (typeof tag === 'string' ? tag : tag.name))
      .join(', ');
  }, []);

  // Buscar operadores com os filtros selecionados
  const handleSearch = useCallback(() => {
    const params: FilterParams = {
      page: 1,
      limit: 10,
      search: searchQuery,
      institutionId: selectedInstitution
    };
    fetchOperators(params);
    setSelectedOperator(null);
  }, [fetchOperators, searchQuery, selectedInstitution, setSelectedOperator]);

  // Mudar de página
  const handlePageChange = useCallback(
    (page: number) => {
      const params: FilterParams = {
        page,
        limit: 10,
        search: searchQuery,
        institutionId: selectedInstitution
      };
      fetchOperators(params);
    },
    [fetchOperators, searchQuery, selectedInstitution]
  );

  // Selecionar um operador para ver detalhes
  const handleSelectOperator = useCallback(
    (operatorId: string) => {
      fetchOperatorDetails(operatorId);
    },
    [fetchOperatorDetails]
  );

  // Abrir modal de edição
  const handleOpenEditModal = useCallback(() => {
    if (selectedOperator) {
      setFormData({
        name: selectedOperator.name,
        email: selectedOperator.email,
        password: '',
        isActive: selectedOperator.isActive === true
      });
      setIsEditModalOpen(true);
    }
  }, [selectedOperator]);

  // Abrir modal para adicionar operador
  const handleOpenAddOperatorModal = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      password: '',
      isActive: true
    });
    setIsAddOperatorModalOpen(true);
  }, []);

  // Manipular alterações no formulário
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Salvar edições
  const handleSubmitEdit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedOperator) {
        const data = { ...formData };
        if (!data.password) delete data.password;

        const success = await updateOperator(selectedOperator.id, data);
        if (success) {
          fetchOperatorDetails(selectedOperator.id);
          setIsEditModalOpen(false);

          // Atualizar o operador na lista
          const params: FilterParams = {
            page: pagination.page,
            limit: 10,
            search: searchQuery,
            institutionId: selectedInstitution
          };
          fetchOperators(params);
        }
      }
    },
    [formData, selectedOperator, updateOperator, fetchOperatorDetails, pagination.page, fetchOperators, searchQuery, selectedInstitution]
  );

  // Adicionar novo operador
  const handleSubmitAddOperator = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.password) {
        toast.error('A senha é obrigatória para novos operadores.');
        return;
      }

      try {
        const basePath = user?.role === 'MANAGER' ? '/managers' : '/admin';
        const endpoint = `${basePath}/operators/create`;

        await api.post(endpoint, formData, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });

        toast.success('Operador criado com sucesso!');
        setIsAddOperatorModalOpen(false);

        // Atualizar a lista
        const params: FilterParams = {
          page: 1,
          limit: 10,
          search: searchQuery,
          institutionId: selectedInstitution
        };
        fetchOperators(params);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Erro ao criar operador');
      }
    },
    [formData, user, fetchOperators, searchQuery, selectedInstitution]
  );

  // Confirmar exclusão de operador
  const handleConfirmDeleteOperator = useCallback(async () => {
    if (selectedOperator && window.confirm(`Deseja realmente excluir o operador ${selectedOperator.name}?`)) {
      const success = await deleteOperator(selectedOperator.id);
      if (success) {
        setSelectedOperator(null);

        // Atualizar a lista
        const params: FilterParams = {
          page: pagination.page,
          limit: 10,
          search: searchQuery,
          institutionId: selectedInstitution
        };
        fetchOperators(params);
      }
    }
  }, [selectedOperator, deleteOperator, setSelectedOperator, pagination.page, fetchOperators, searchQuery, selectedInstitution]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Gerenciamento de Operadores</h1>

        <OperatorSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedInstitution={selectedInstitution}
          setSelectedInstitution={setSelectedInstitution}
          institutions={institutions}
          handleSearch={handleSearch}
          isAdmin={user?.role === 'ADMIN'}
          onAddOperator={handleOpenAddOperatorModal}
        />

        {loading && operators.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Carregando operadores...</span>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="lg:flex">
              <div className="lg:w-1/3 border-r">
                <div className="p-4 bg-blue-50 border-b">
                  <h2 className="font-semibold text-gray-800">Lista de Operadores</h2>
                </div>
                <div className="p-4">
                  <OperatorList
                    operators={operators}
                    selectedOperatorId={selectedOperator?.id || null}
                    onSelectOperator={handleSelectOperator}
                    isOperatorActive={isOperatorActive}
                  />
                </div>
                <Pagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              </div>
              <div className="lg:w-2/3">
                {selectedOperator ? (
                  <OperatorDetails
                    operator={selectedOperator}
                    isOperatorActive={isOperatorActive}
                    formatDate={formatDate}
                    getPostTags={getPostTags}
                    onEdit={handleOpenEditModal}
                    onDelete={handleConfirmDeleteOperator}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 bg-gray-50 p-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-gray-300 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <p className="text-gray-500 text-lg text-center">
                      Selecione um operador para ver seus detalhes
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Editar Operador</h2>
              <OperatorForm
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmitEdit}
                loading={loading}
                onCancel={() => setIsEditModalOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Adicionar Operador */}
        <Dialog open={isAddOperatorModalOpen} onOpenChange={setIsAddOperatorModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Novo Operador</h2>
              <OperatorForm
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmitAddOperator}
                loading={loading}
                onCancel={() => setIsAddOperatorModalOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default OperatorManagementPage; 