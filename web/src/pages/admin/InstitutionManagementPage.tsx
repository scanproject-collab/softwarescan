import React, { useEffect, useState, useCallback } from 'react';
import { useInstitutions } from '../../features/institutions/hooks/useInstitutions';
import { InstitutionDialog } from '../../features/institutions/components/InstitutionDialog';
import Navbar from '../../features/common/components/Navbar';
import { Institution } from '../../features/institutions/types/institutions';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';
import { Trash2, Pencil, Plus, RefreshCw, Search, FileDown, Users, UserPlus, UserMinus, ArrowLeftRight, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import api from '../../shared/services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../shared/hooks/useToast';


const InstitutionManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [currentInstitution, setCurrentInstitution] = useState<Institution | undefined>(undefined);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [institutionUsers, setInstitutionUsers] = useState<Array<{ id: string, name: string, email: string, role: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [targetInstitutionId, setTargetInstitutionId] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 6;
  const { token } = useAuth();
  const toast = useToast();

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

  // Use this callback to ensure we don't trigger unnecessary re-renders
  const loadData = useCallback(async () => {
    await fetchInstitutions();
    setInitialLoadComplete(true);
  }, [fetchInstitutions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  // Fetch users for a specific institution with pagination
  const fetchInstitutionUsers = async (institutionId: string, page = 1, limit = 100) => {
    if (!token) return { users: [], total: 0, totalPages: 1 };
    try {
      setLoadingUsers(true);
      // Try to get as many users as possible
      const response = await api.get(`/admin/operators`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          institutionId,
          page,
          limit
        }
      });

      // Get the total count from pagination or default to array length
      const totalCount = response.data.pagination?.total || response.data.operators.length;
      // Calculate total pages based on our UI's users per page
      const calculatedTotalPages = Math.ceil(totalCount / usersPerPage);

      return {
        users: response.data.operators || [],
        total: totalCount,
        totalPages: calculatedTotalPages
      };
    } catch (error) {
      toast.error('Erro ao carregar usuários da instituição.');
      console.error(error);
      return { users: [], total: 0, totalPages: 1 };
    } finally {
      setLoadingUsers(false);
    }
  };

  const openUsersDialog = async (institution: Institution) => {
    setCurrentInstitution(institution);
    setSelectedUserId('');
    setTargetInstitutionId('');
    setIsUsersDialogOpen(true);
    setCurrentPage(1);

    // Fetch all users for this institution
    const { users, total, totalPages: pages } = await fetchInstitutionUsers(institution.id);
    setInstitutionUsers(users);
    setTotalUsers(total);
    setTotalPages(pages);
  };

  // Get paginated users
  const getPaginatedUsers = () => {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return institutionUsers.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  // Move user to another institution
  const handleMoveUser = async () => {
    if (!selectedUserId || !targetInstitutionId || !currentInstitution || !token) return;

    try {
      setLoadingUsers(true);
      await api.put(`/admin/users/${selectedUserId}`,
        { institutionId: targetInstitutionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Usuário movido com sucesso!');

      // Refresh the current institution's users
      const { users, total, totalPages: pages } = await fetchInstitutionUsers(currentInstitution.id);
      setInstitutionUsers(users);
      setTotalUsers(total);
      setTotalPages(pages);

      // Reset selection
      setSelectedUserId('');
      setTargetInstitutionId('');

      // Refresh institutions to update user counts
      fetchInstitutions();
    } catch (error) {
      toast.error('Erro ao mover usuário.');
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Add a new user to the institution
  const handleAddNewUser = async () => {
    if (!currentInstitution || !token) return;

    try {
      setLoadingUsers(true);
      // In a real app, this would open a dialog to select from users without institutions
      // For now, redirect to user management or show a message
      toast.info('Para adicionar usuários, vá para a página de gerenciamento de usuários.');
    } catch (error) {
      toast.error('Erro ao adicionar usuário.');
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Remove user from institution
  const handleRemoveUser = async (userId: string) => {
    if (!currentInstitution || !token) return;

    try {
      setLoadingUsers(true);
      await api.put(`/admin/users/${userId}`,
        { institutionId: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Usuário removido da instituição com sucesso!');

      // Update the displayed users list
      setInstitutionUsers(prev => prev.filter(user => user.id !== userId));
      setTotalUsers(prev => prev - 1);
      setTotalPages(Math.ceil((totalUsers - 1) / usersPerPage));

      // Refresh institutions to update user counts
      fetchInstitutions();
    } catch (error) {
      toast.error('Erro ao remover usuário.');
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Format role to a more user-friendly display name
  const formatRole = (role: string) => {
    const roleMap: Record<string, string> = {
      'ADMIN': 'Administrador',
      'MANAGER': 'Gerente',
      'OPERATOR': 'Operador',
      'USER': 'Usuário',
      'SUPERVISOR': 'Supervisor',
      'VIEWER': 'Visualizador'
    };

    return roleMap[role] || role;
  };

  // Get role badge color based on role
  const getRoleBadgeColor = (role: string) => {
    const colorMap: Record<string, string> = {
      'ADMIN': 'bg-purple-100 text-purple-800',
      'MANAGER': 'bg-blue-100 text-blue-800',
      'OPERATOR': 'bg-green-100 text-green-800',
      'USER': 'bg-gray-100 text-gray-800',
      'SUPERVISOR': 'bg-orange-100 text-orange-800',
      'VIEWER': 'bg-teal-100 text-teal-800'
    };

    return colorMap[role] || 'bg-blue-100 text-blue-800';
  };

  const handleRefresh = () => {
    fetchInstitutions();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleExportCSV = () => {
    const institutions = getSortedInstitutions();
    if (institutions.length === 0) return;

    // Formato consistente para datas
    const formatDateForExport = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    };

    // Cabeçalhos descritivos para as colunas
    const headers = [
      'ID da Instituição',
      'Nome da Instituição',
      'Número de Usuários',
      'Data de Cadastro',
      'Última Atualização',
      'Nome do Administrador',
      'Email do Administrador'
    ];

    // Dados das instituições com melhor organização
    const data = institutions.map(institution => {
      // Obter informações do autor quando disponíveis
      const authorName = institution.author?.name || 'Não informado';
      const authorEmail = institution.author?.email || 'Não informado';

      return [
        institution.id,
        institution.title,
        institution.userCount || 0,
        formatDateForExport(institution.createdAt),
        formatDateForExport(institution.updatedAt || institution.createdAt),
        authorName,
        authorEmail
      ];
    });

    // Função para escapar valores adequadamente
    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '""';

      const stringValue = String(value).trim();
      // Substituir aspas duplas por duas aspas duplas (padrão CSV)
      const escapedValue = stringValue.replace(/"/g, '""');
      // Sempre envolver em aspas para lidar com caracteres especiais
      return `"${escapedValue}"`;
    };

    // Combinar tudo com escape adequado
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...data.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    // Adicionar BOM para UTF-8 compatibilidade com Excel
    const BOM = '\uFEFF';
    const csvContentWithBOM = BOM + csvContent;

    // Criar o blob e download
    const blob = new Blob([csvContentWithBOM], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);

    // Incluir data e hora no nome do arquivo para melhor organização
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    link.setAttribute('download', `instituicoes_${date}_${time}.csv`);

    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Liberar recursos
  };

  const sortedInstitutions = getSortedInstitutions();

  // Only show loading on initial load, not during refreshes
  const showLoading = !initialLoadComplete && loading;

  // Pagination UI
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center mt-4 gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm text-gray-600">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Instituições</h1>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="rounded-md bg-green-600 p-2 text-white hover:bg-green-700 transition"
              disabled={loading || sortedInstitutions.length === 0}
              title="Exportar para CSV"
            >
              <FileDown className="h-5 w-5" />
            </button>
            <button
              onClick={handleRefresh}
              className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700 transition"
              disabled={loading}
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="rounded-md bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600 transition flex items-center gap-2"
              disabled={loading}
            >
              <Plus className="h-5 w-5" />
              Nova Instituição
            </button>
          </div>
        </div>

        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar instituições..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 pl-10 p-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
          />
        </div>

        {showLoading ? (
          <div className="h-64">
            <LoadingSpinner size="lg" text="Carregando instituições..." color="orange" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white shadow-md">
            {sortedInstitutions.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-gray-500">Nenhuma instituição encontrada.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Título
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Usuários
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Data de Criação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {sortedInstitutions.map((institution) => (
                      <tr key={institution.id} className="hover:bg-gray-50 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {institution.title}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                          <button
                            onClick={() => openUsersDialog(institution)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition"
                          >
                            <Users className="h-3.5 w-3.5" />
                            {institution.userCount || 0} usuários
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                          {formatDate(institution.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditDialog(institution)}
                              className="rounded-md bg-blue-100 p-1 text-blue-700 hover:bg-blue-200 transition"
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteInstitution(institution.id)}
                              className="rounded-md bg-red-100 p-1 text-red-700 hover:bg-red-200 transition"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

      {/* Dialog para gerenciamento de usuários */}
      <Dialog.Root open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg" aria-describedby="user-management-description">
            <Dialog.Title className="text-xl font-bold">
              Usuários da Instituição: {currentInstitution?.title}
            </Dialog.Title>

            <Dialog.Description id="user-management-description" className="sr-only">
              Gerencie os usuários associados a esta instituição
            </Dialog.Description>

            <div className="mt-4 mb-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Total: <span className="font-semibold">{totalUsers} usuários</span>
                </span>
              </div>
              <button
                onClick={handleAddNewUser}
                className="rounded-md bg-green-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-600 transition flex items-center gap-1"
              >
                <UserPlus className="h-4 w-4" />
                Adicionar Usuário
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loadingUsers ? (
                <div className="py-8 flex justify-center">
                  <LoadingSpinner size="md" color="blue" text="Carregando usuários..." />
                </div>
              ) : institutionUsers.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500">Nenhum usuário nesta instituição.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                          Nome
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                          Email
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                          Cargo
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {getPaginatedUsers().map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                            {user.name || 'Sem nome'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Briefcase className="h-3.5 w-3.5 mr-1 text-gray-400 flex-shrink-0" />
                              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                {formatRole(user.role)}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUserId(user.id);
                                }}
                                className="rounded-md bg-blue-100 p-1 text-blue-700 hover:bg-blue-200 transition flex gap-1 items-center"
                                title="Mover para outra instituição"
                              >
                                <ArrowLeftRight className="h-3.5 w-3.5" />
                                <span className="text-xs">Mover</span>
                              </button>
                              <button
                                onClick={() => handleRemoveUser(user.id)}
                                className="rounded-md bg-red-100 p-1 text-red-700 hover:bg-red-200 transition flex gap-1 items-center"
                                title="Remover da instituição"
                              >
                                <UserMinus className="h-3.5 w-3.5" />
                                <span className="text-xs">Remover</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination controls */}
                  {renderPagination()}
                </div>
              )}
            </div>

            {selectedUserId && (
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h3 className="text-sm font-semibold mb-2">Mover Usuário para outra Instituição</h3>
                <div className="flex gap-2">
                  <select
                    value={targetInstitutionId}
                    onChange={(e) => setTargetInstitutionId(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Selecione uma instituição</option>
                    {sortedInstitutions
                      .filter(inst => inst.id !== currentInstitution?.id)
                      .map(institution => (
                        <option key={institution.id} value={institution.id}>
                          {institution.title}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleMoveUser}
                    disabled={!targetInstitutionId}
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400 transition"
                  >
                    Mover
                  </button>
                  <button
                    onClick={() => setSelectedUserId('')}
                    className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Dialog.Close asChild>
                <button className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition">
                  Fechar
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default InstitutionManagement;