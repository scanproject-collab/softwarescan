import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Modal from "react-modal";
import { CheckCircle, XCircle, Trash2, RefreshCw, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

// Components
import Navbar from "./features/common/components/Navbar";
import TagFilterDropdown from "./features/tags/components/TagFilterDropdown";
import MapModal from "./features/maps/components/MapModal";
import LoadingSpinner from "./shared/components/ui/LoadingSpinner";

import { useAuth } from "./hooks/useAuth";
import { useMapModal } from "./features/maps/hooks/useMapModal";
import { useInteractions } from "./features/interactions/hooks/useInteractions";
import { useInteractionFilters } from "./features/interactions/hooks/useInteractionFilters";
import { useDeleteInteractionModal } from "./features/interactions/hooks/useDeleteInteractionModal";
import { usePendingOperators } from "./features/operators/hooks/usePendingOperators";

import { showError } from "./shared/utils/errorHandler";

const ExportButton = ({ interactions, disabled }: { interactions: any; disabled?: boolean }) => {
  const handleExport = () => {
    if (interactions.length === 0) return;
    const headers = [
      'ID',
      'Título da Ocorrência',
      'Descrição',
      'Tipo de Ocorrência',
      'Latitude',
      'Longitude',
      'Data de Registro',
      'Hora de Registro',
      'Nome do Autor',
      'Email do Autor',
      'Instituição',
      'Prioridade',
      'Peso'
    ];

    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    };

    const formatTime = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleTimeString('pt-BR');
    };

    const data = interactions.map((interaction: any) => {
      const createdAt = interaction.createdAt ? new Date(interaction.createdAt) : null;

      return [
        interaction.id || '',
        interaction.title || 'Sem título',
        interaction.content || 'Sem descrição',
        (interaction.tags || []).join('; '),
        interaction.latitude || '',
        interaction.longitude || '',
        createdAt ? formatDate(interaction.createdAt) : '',
        createdAt ? formatTime(interaction.createdAt) : '',
        interaction.author?.name || 'Não informado',
        interaction.author?.email || 'Não informado',
        interaction.author?.institution?.title || 'Não vinculado',
        interaction.ranking || 'Não definido',
        interaction.weight || '0'
      ];
    });

    // Properly escape values that may contain commas, quotes or newlines
    const escapeCSV = (value: any) => {
      const stringValue = String(value).trim();
      // Replace any double quotes with two double quotes (CSV standard for escaping quotes)
      const escapedValue = stringValue.replace(/"/g, '""');
      // Always wrap in quotes to handle any special characters
      return `"${escapedValue}"`;
    };

    // Combine everything with proper escaping
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...data.map((row: any[]) => row.map(escapeCSV).join(','))
    ].join('\n');

    // Add UTF-8 BOM for better Excel compatibility
    const BOM = '\uFEFF';
    const csvContentWithBOM = BOM + csvContent;

    // Create a blob and download
    const blob = new Blob([csvContentWithBOM], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    link.setAttribute('download', `ocorrencias_${date}_${time}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700"
      disabled={disabled || interactions.length === 0}
    >
      <RefreshCw className="h-4 w-4" />
      Exportar
    </button>
  );
};

Modal.setAppElement("#root");

const App: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!token && pathname !== "/login") {
      console.log("Token não encontrado, redirecionando para /login...");
      navigate("/login");
    }
  }, [token, pathname, navigate]);

  const {
    pendingOperators,
    error: pendingOperatorsError,
    handleApproveOperator,
    handleRejectOperator,
  } = usePendingOperators();

  const {
    interactions,
    loading,
    error: interactionsError,
    handleRefresh,
    setInteractions,
    refreshing,
  } = useInteractions();

  const {
    searchTerm,
    setSearchTerm,
    selectedTags,
    setSelectedTags,
    selectedRanking,
    setSelectedRanking,
    selectedInstitution,
    setSelectedInstitution,
    selectedUser,
    setSelectedUser,
    usersInInstitution,
    filteredInteractions,
    uniqueTags,
    uniqueRankings,
    uniqueInstitutions,
  } = useInteractionFilters(interactions as any);

  const toggleTagSelection = (tag: string) => {
    if (tag === "Todas as tags") {
      if (selectedTags.length === uniqueTags.length) {
        setSelectedTags([]);
      } else {
        setSelectedTags(uniqueTags);
      }
    } else {
      const updateTags = (prevTags: string[]): string[] => {
        return prevTags.includes(tag)
          ? prevTags.filter((t: string) => t !== tag)
          : [...prevTags, tag];
      };

      setSelectedTags(updateTags(selectedTags));
    }
  };

  // Reset to first page when filters change
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTags, selectedInstitution, selectedRanking, searchTerm, selectedUser]);

  const {
    isModalOpen,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteInteraction,
  } = useDeleteInteractionModal(setInteractions, interactions);

  const {
    isMapModalOpen,
    selectedInteraction,
    openMapModal,
    closeMapModal,
  } = useMapModal();

  // Pagination state and handlers
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredInteractions.length / itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else {
      showError("Você já está na primeira página");
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else {
      showError("Não há mais páginas disponíveis");
    }
  };

  if (pendingOperatorsError || interactionsError) {
    return (
      <div className="p-6 text-center text-red-500">
        {pendingOperatorsError || interactionsError}
      </div>
    );
  }

  const getWeightBadgeColor = (weight: string | number | undefined) => {
    const weightValue = parseFloat(String(weight)) || 0;
    if (weightValue >= 350) return "bg-red-500 text-white";
    if (weightValue >= 150) return "bg-orange-500 text-white";
    return "bg-yellow-500 text-black";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex gap-2 items-center">
                <ExportButton
                  interactions={filteredInteractions}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Vínculos</h2>
            </div>
            <div className="mb-4 flex items-center gap-2 rounded bg-blue-50 p-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-300 text-gray-700 font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "G"}
              </div>
              <div>
                <p className="font-medium">{user?.name || "Gestor"}</p>
                <p className="text-sm text-gray-600">{user?.institution?.title || "DINT PMAL"}</p>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Aprovações pendentes</h3>
              {pendingOperators.map((operator: any) => (
                <div
                  key={operator.id}
                  className="mb-2 flex items-center justify-between rounded bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-300" />
                    <div>
                      <p>{operator.name || "Unnamed"} - {operator.email}</p>
                      <p className="text-sm text-gray-600">
                        Criado em: {new Date(operator.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveOperator(operator.id)}
                      className="text-green-500"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleRejectOperator(operator.id)}
                      className="text-red-500"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Últimas interações</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  className={`rounded ${refreshing ? 'bg-blue-400' : 'bg-blue-600'} p-2 text-white hover:bg-blue-700 transition-colors relative`}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-300 animate-ping"></span>
                  )}
                </button>
              </div>
            </div>
            <div className="mb-4 flex gap-4 flex-wrap">
              <input
                type="text"
                placeholder="Buscar por nome do operador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto flex-grow rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <select
                value={selectedRanking || ""}
                onChange={(e) => setSelectedRanking(e.target.value || null)}
                className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Todas as Prioridades</option>
                {uniqueRankings.map((ranking: any) => (
                  <option key={ranking} value={ranking}>
                    {ranking}
                  </option>
                ))}
              </select>

              {/* Institution and User filters - Admin only */}
              {user?.role === "ADMIN" && (
                <>
                  <select
                    value={selectedInstitution || ""}
                    onChange={(e) => setSelectedInstitution(e.target.value || null)}
                    className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">Todas as Instituições</option>
                    {uniqueInstitutions.map((institution: any) => (
                      <option key={institution.id} value={institution.id}>
                        {institution.title}
                      </option>
                    ))}
                  </select>

                  {selectedInstitution && (
                    <select
                      value={selectedUser || ""}
                      onChange={(e) => setSelectedUser(e.target.value || null)}
                      className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <option value="">Todos os Usuários</option>
                      {usersInInstitution.map((user: any) => (
                        <option key={user.id} value={user.id}>
                          {user.name || "Unnamed"} ({user.email})
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}

              {/* Tag filter - Available for both Admin and Manager */}
              {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
                <TagFilterDropdown
                  uniqueTags={uniqueTags}
                  selectedTags={selectedTags}
                  toggleTagSelection={toggleTagSelection}
                />
              )}
            </div>
            <div className="space-y-6">
              {loading && !refreshing ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="md" text="Carregando interações..." color="primary" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredInteractions.length > 0 ? (
                      filteredInteractions
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((interaction: any, index: number) => (
                          <div key={index} className="rounded-lg bg-white p-4 shadow relative">
                            <div className="absolute top-2 left-2">
                              <span
                                className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getWeightBadgeColor(
                                  interaction.weight
                                )}`}
                              >
                                Peso: {interaction.weight || "0"}
                              </span>
                            </div>
                            <button
                              onClick={() => openDeleteModal(interaction.id)}
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                            <div className="mt-8 mb-4 flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-blue-100 text-center leading-8 text-blue-600">
                                {interaction.author?.name?.[0] || "A"}
                              </div>
                              <p className="font-medium">{interaction.title || "Interação"}</p>
                            </div>
                            {interaction.imageUrl ? (
                              <img
                                src={interaction.imageUrl}
                                alt="Imagem da interação"
                                className="mb-4 h-40 w-full object-cover rounded"
                              />
                            ) : (
                              <div className="mb-4 h-24 rounded bg-gray-200" />
                            )}
                            <p className="text-sm text-gray-600">
                              Data e hora: {new Date(interaction.createdAt || "").toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Tipo: {interaction.tags?.join(", ") || "Sem tipo"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Ranking: {interaction.ranking || "Não definido"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Observações: {interaction.content || "Sem observações"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Autor: {interaction.author?.name || "Unnamed"} ({interaction.author?.email || "Sem email"})
                            </p>
                            <p className="text-sm text-gray-600">
                              Instituição: {typeof interaction.author?.institution === 'object'
                                ? interaction.author.institution.title
                                : interaction.author?.institution || "Sem instituição"}
                            </p>
                            {interaction.latitude && interaction.longitude && (
                              <button
                                onClick={() => openMapModal(interaction)}
                                className="mt-2 flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                              >
                                <MapPin className="h-4 w-4" />
                                Localizar no Mapa
                              </button>
                            )}
                            <Link
                              to={`/user/${interaction.author?.id}`}
                              className="mt-2 inline-block text-blue-600 hover:underline"
                            >
                              Ver Perfil do Usuário
                            </Link>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-600 text-center col-span-full">
                        Nenhuma interação encontrada para os filtros selecionados.
                      </p>
                    )}
                  </div>
                  {/* Pagination Controls */}
                  {filteredInteractions.length > 0 && (
                    <div className="flex justify-center items-center gap-4">
                      <button
                        onClick={handlePreviousPage}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <span className="text-gray-700">
                        Página {currentPage} de {totalPages}
                      </span>
                      <button
                        onClick={handleNextPage}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeDeleteModal}
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirmar Exclusão</h2>
          <p className="text-gray-600 mb-6">
            Tem certeza que deseja excluir esta interação? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeDeleteModal}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                handleDeleteInteraction();
                closeDeleteModal();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>

      {/* Map Modal */}
      <Modal
        isOpen={isMapModalOpen}
        onRequestClose={closeMapModal}
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Localização da Interação</h2>
          {selectedInteraction && (
            <MapModal
              latitude={selectedInteraction.latitude || 0}
              longitude={selectedInteraction.longitude || 0}
              title={selectedInteraction.title || "Interação"}
            />
          )}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={closeMapModal}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;