import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import { CheckCircle, XCircle, Trash2, RefreshCw, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "react-modal";
import { usePendingOperators } from "./components/admin/usePendingOperators";
import { useInteractions } from "./components/admin/useInteractions";
import { useInteractionFilters } from "./components/admin/useInteractionFilters";
import { useDeleteInteractionModal } from "./components/admin/useDeleteInteractionModal";

Modal.setAppElement("#root");

const App: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!token && pathname !== "/login") {
      console.log("Token não encontrado, redirecionando para /login...");
      navigate("/login");
      navigate("/login");
    }
  }, [token, pathname, navigate]);

  const {
    pendingOperators,
    error: pendingOperatorsError,
    handleApproveOperator,
    handleRejectOperator,
    fetchPendingOperators,
  } = usePendingOperators();

  const {
    interactions,
    loading,
    error: interactionsError,
    fetchInteractions,
    handleRefresh,
    setInteractions,
    setLoading,
  } = useInteractions();

  const {
    searchTerm,
    setSearchTerm,
    selectedTag,
    setSelectedTag,
    selectedRanking,
    setSelectedRanking,
    filteredInteractions,
    uniqueTags,
    uniqueRankings,
  } = useInteractionFilters(interactions);

  const {
    isModalOpen,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteInteraction,
    postToDelete,
  } = useDeleteInteractionModal(setInteractions, interactions);

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

  return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Toaster />
        <div className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <img
                src="/scan-removebg-preview.png"
                alt="PMAL Logo"
                className="h-16 w-16"
            />
            <div>
              <h1 className="text-2xl font-bold">
                Projeto Ações Solidárias - DINT PMAL
              </h1>
              <p className="text-gray-600">Descrição do Ações Solidárias...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="col-span-1 rounded-lg bg-white p-4 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Vínculos</h2>
                <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                  Ver tudo
                </button>
              </div>
              <div className="mb-4 flex items-center gap-2 rounded bg-blue-50 p-3">
                <div className="h-10 w-10 rounded-full bg-gray-300" />
                <div>
                  <p className="font-medium">Gestor</p>
                  <p className="text-sm text-gray-600">DINT PMAL</p>
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
                          <p>
                            {operator.name || "Unnamed"} - {operator.email}
                          </p>
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
              <button className="mt-4 w-full rounded border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50">
                Ver no mapa
              </button>
            </div>
            <div className="col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Últimas interações</h2>
                <div className="flex gap-2">
                  <button
                      onClick={handleRefresh}
                      className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                  <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                    Ver tudo
                  </button>
                </div>
              </div>
              <div className="mb-4 flex gap-4">
                <input
                    type="text"
                    placeholder="Buscar por nome do operador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <select
                    value={selectedTag || ""}
                    onChange={(e) => setSelectedTag(e.target.value || null)}
                    className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">Todas as Tags</option>
                  {uniqueTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                  ))}
                </select>
                <select
                    value={selectedRanking || ""}
                    onChange={(e) => setSelectedRanking(e.target.value || null)}
                    className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">Todos os Rankings</option>
                  {uniqueRankings.map((ranking) => (
                      <option key={ranking} value={ranking}>
                        {ranking}
                      </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredInteractions.map((interaction, index) => (
                    <div
                        key={index}
                        className="rounded-lg bg-white p-4 shadow relative"
                    >
                      <button
                          onClick={() => openDeleteModal(interaction.id)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <div className="mb-4 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-center leading-8 text-blue-600">
                          {interaction.author.name?.[0] || "A"}
                        </div>
                        <p className="font-medium">
                          {interaction.title || "Interação"}
                        </p>
                      </div>
                      {interaction.imageUrl ? (
                          <img
                              src={interaction.imageUrl}
                              alt="Imagem da interação"
                              className="mb-4 h-24 w-full object-cover rounded"
                          />
                      ) : (
                          <div className="mb-4 h-24 rounded bg-gray-200" />
                      )}
                      <p className="text-sm text-gray-600">
                        Data e hora: {new Date(interaction.createdAt).toLocaleString()}
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
                        Autor: {interaction.author.name || "Unnamed"} (
                        {interaction.author.email})
                      </p>
                      <p className="text-sm text-gray-600">
                        Instituição:{" "}
                        {interaction.author.institution?.title || "Sem instituição"}
                      </p>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Modal
            isOpen={isModalOpen}
            onRequestClose={closeDeleteModal}
            className="fixed inset-0 flex items-center justify-center p-4"
            overlayClassName="fixed inset-0"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Confirmar Exclusão
            </h2>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir esta interação? Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                  onClick={handleDeleteInteraction}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </Modal>
      </div>
  );
};

export default App;