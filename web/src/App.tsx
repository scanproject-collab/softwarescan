import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import { CheckCircle, XCircle } from "lucide-react";
import api from "./service/api";
import logo from "/scan-removebg-preview.png";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth"; 

const App: React.FC = () => {
  const [pendingOperators, setPendingOperators] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { token } = useAuth(); // Usando o hook para obter o token

  // Função para buscar operadores pendentes
  const fetchPendingOperators = async () => {
    if (!token) return; // O useAuth já redireciona, mas deixamos como segurança
    try {
      const response = await api.get("/admin/pending-operators", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingOperators(response.data.operators);
    } catch (err) {
      setError("Erro ao carregar operadores pendentes.");
      toast.error("Erro ao carregar operadores pendentes.");
      console.error(err);
    }
  };

  // Função para buscar todas as interações
  const fetchInteractions = async () => {
    if (!token) return;
    try {
      const response = await api.get("/posts/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInteractions(response.data.posts || []);
    } catch (err) {
      setError("Erro ao carregar interações.");
      toast.error("Erro ao carregar interações.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Aprovar operador
  const handleApproveOperator = async (operatorId: string) => {
    if (!token) return;
    try {
      await api.post(
        `/admin/approve-operator/${operatorId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingOperators();
      toast.success("Operador aprovado com sucesso!");
    } catch (err) {
      setError("Erro ao aprovar operador.");
      toast.error("Erro ao aprovar operador.");
      console.error(err);
    }
  };

  // Rejeitar operador
  const handleRejectOperator = async (operatorId: string) => {
    if (!token) return;
    try {
      await api.delete(`/admin/reject-operator/${operatorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPendingOperators();
      toast.success("Operador rejeitado com sucesso!");
    } catch (err) {
      setError("Erro ao rejeitar operador.");
      toast.error("Erro ao rejeitar operador.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPendingOperators();
    fetchInteractions();
  }, [token]); // Dependência no token para recarregar se ele mudar

  // Filtrar interações por nome do autor
  const filteredInteractions = interactions.filter((interaction) =>
    interaction.author.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
  );

  if (loading) return <div className="p-6 text-center">Carregando...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Toaster />

      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <img src={logo} alt="PMAL Logo" className="h-16 w-16" />
          <div>
            <h1 className="text-2xl font-bold">
              Projeto Ações Solidárias - DINT PMAL
            </h1>
            <p className="text-gray-600">Descrição do Ações Solidárias...</p>
          </div>
        </div>

        {/* Vínculos e Últimas Interações */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Seção Vínculos */}
          <div className="col-span-1 rounded-lg bg-white p-4 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Vínculos</h2>
              <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                Ver tudo
              </button>
            </div>

            {/* Gestor */}
            <div className="mb-4 flex items-center gap-2 rounded bg-blue-50 p-3">
              <div className="h-10 w-10 rounded-full bg-gray-300" />
              <div>
                <p className="font-medium">Gestor</p>
                <p className="text-sm text-gray-600">DINT PMAL</p>
              </div>
            </div>

            {/* Aprovações pendentes */}
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

            {/* Botão Ver no mapa */}
            <button className="mt-4 w-full rounded border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50">
              Ver no mapa
            </button>
          </div>

          {/* Seção Últimas Interações */}
          <div className="col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Últimas interações</h2>
              <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                Ver tudo
              </button>
            </div>

            {/* Campo de busca */}
            <input
              type="text"
              placeholder="Buscar por nome do operador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredInteractions.map((interaction, index) => (
                <div key={index} className="rounded-lg bg-white p-4 shadow">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-center leading-8 text-blue-600">
                      {interaction.author.name?.[0] || "A"}
                    </div>
                    <p className="font-medium">{interaction.title || "Interação"}</p>
                  </div>
                  <div className="mb-4 h-24 rounded bg-gray-200" />
                  <p className="text-sm text-gray-600">
                    Data e hora: {new Date(interaction.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tipo: {interaction.tags?.join(", ") || "Sem tipo"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Observações: {interaction.content || "Sem observações"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Autor: {interaction.author.name || "Unnamed"} ({interaction.author.email})
                  </p>
                  <p className="text-sm text-gray-600">
                    Instituição: {interaction.author.institution?.title || "Sem instituição"}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button className="w-full rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
                      Editar
                    </button>
                    <button className="w-full rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;