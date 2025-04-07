import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { CheckCircle, XCircle, Trash2, RefreshCw, Loader2, MapPin } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Modal from "react-modal";
import { usePendingOperators } from "./components/admin/usePendingOperators";
import { useInteractions } from "./components/admin/useInteractions";
import { useInteractionFilters } from "./components/admin/useInteractionFilters";
import { useDeleteInteractionModal } from "./components/admin/useDeleteInteractionModal";
import { useMapModal } from "./components/admin/useMapModal";
import MapModal from "./components/MapModal";
import { Interaction } from "./types/types"; 
import TagFilterDropdown from "./components/admin/dropdownTagFilter";
import { ExportButton } from "./components/ExportDatasForExcel";

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

  const toggleTagSelection = (tag: string) => {
    if (tag === "Todas as tags") {
      if (selectedTags.length === uniqueTags.length) {
        setSelectedTags([]);
      } else {
        setSelectedTags(uniqueTags);
      }
    } else {
      setSelectedTags((prevTags) =>
        prevTags.includes(tag) ? prevTags.filter(t => t !== tag) : [...prevTags, tag]
      );
    }
  };

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
  } = useInteractionFilters(interactions);

  // Reset to first page when filters change
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (pendingOperatorsError || interactionsError) {
    return (
      <div className="p-6 text-center text-red-500">
        {pendingOperatorsError || interactionsError}
      </div>
    );
  }

  const getWeightBadgeColor = (weight: string | number | undefined) => {
    const weightValue = parseFloat(String(weight)) || 0;
    if (weightValue >= 10) return "bg-red-500 text-white";
    if (weightValue >= 5) return "bg-orange-500 text-white";
    return "bg-yellow-500 text-black";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Toaster />
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
              {pendingOperators.map((operator) => (
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
                  className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
                >
                  <RefreshCw className="h-5 w-5" />
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
                {uniqueRankings.map((ranking) => (
                  <option key={ranking} value={ranking}>
                    {ranking}
                  </option>
                ))}
              </select>
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
                      {usersInInstitution.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name || "Unnamed"} ({user.email})
                        </option>
                      ))}
                    </select>
                  )}
                <TagFilterDropdown 
                uniqueTags={uniqueTags} 
                selectedTags={selectedTags} 
                toggleTagSelection={toggleTagSelection} 
                />
                </>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredInteractions.length > 0 ? (
                filteredInteractions
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((interaction: Interaction, index: number) => (
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
                        {interaction.author.name?.[0] || "A"}
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
                      Autor: {interaction.author.name || "Unnamed"} ({interaction.author.email || "Sem email"})
                    </p>
                    <p className="text-sm text-gray-600">
                      Instituição: {interaction.author.institution?.title || "Sem instituição"}
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
                      to={`/user/${interaction.author.id}`}
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