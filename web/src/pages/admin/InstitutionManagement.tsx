import React, { useState, useEffect } from "react";
import api from "../../services/api.ts";
import { useAuth } from "../../hooks/useAuth.ts";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../components/Navbar.tsx";
import { Trash2, Pencil, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
} from "../../components/ui/dialog.tsx";

interface Institution {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userCount: number; 
}

interface InstitutionResponse {
  message: string;
  institutions: Institution[];
}

const InstitutionManagement: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [newInstitutionTitle, setNewInstitutionTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [sortBy, setSortBy] = useState<"title" | "createdAt">("title"); 
  const { token } = useAuth();

  
  const fetchInstitutions = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api.get<InstitutionResponse>("/institutions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const institutionList = response.data.institutions || [];
      setInstitutions(institutionList);
    } catch (err) {
      toast.error("Erro ao carregar instituições.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchInstitutions();
    const interval = setInterval(fetchInstitutions, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleCreateInstitution = async () => {
    if (!newInstitutionTitle) {
      toast.error("O título da instituição não pode estar vazio.");
      return;
    }

    try {
      await api.post(
        "/institutions",
        { title: newInstitutionTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewInstitutionTitle("");
      toast.success("Instituição criada com sucesso!");
      fetchInstitutions();
    } catch (err) {
      toast.error("Erro ao criar instituição.");
      console.error(err);
    }
  };

  
  const handleUpdateInstitution = async () => {
    if (!editingInstitution || !newInstitutionTitle) {
      toast.error("O título da instituição não pode estar vazio.");
      return;
    }

    try {
      await api.put(
        `/institutions/${editingInstitution.id}`,
        { title: newInstitutionTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingInstitution(null);
      setNewInstitutionTitle("");
      toast.success("Instituição atualizada com sucesso!");
      fetchInstitutions();
    } catch (err) {
      toast.error("Erro ao atualizar instituição.");
      console.error(err);
    }
  };


  const handleDeleteInstitution = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir a instituição?")) {
      try {
        await api.delete(`/institutions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Instituição excluída com sucesso!");
        fetchInstitutions();
      } catch (err) {
        toast.error("Erro ao excluir instituição.");
        console.error(err);
      }
    }
  };


  const filteredInstitutions = institutions.filter((inst) =>
    inst.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  const sortedInstitutions = [...filteredInstitutions].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "createdAt") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Toaster />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciamento de Instituições</h1>
          <button
            onClick={fetchInstitutions}
            className="flex items-center gap-2 rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            <RefreshCw className="h-5 w-5" />
            Atualizar
          </button>
        </div>

        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Pesquisar instituição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <Dialog>
            <DialogTrigger asChild>
              <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Criar Instituição
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Instituição</DialogTitle>
                <DialogDescription>
                  Preencha o título da nova instituição.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <input
                  type="text"
                  placeholder="Título da instituição"
                  value={newInstitutionTitle}
                  onChange={(e) => setNewInstitutionTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <button className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400">
                    Cancelar
                  </button>
                </DialogClose>
                <button
                  onClick={handleCreateInstitution}
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Criar
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4 flex gap-4">
          <button
            onClick={() => setSortBy("title")}
            className={`rounded px-4 py-2 ${
              sortBy === "title"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Ordenar por Título
          </button>
          <button
            onClick={() => setSortBy("createdAt")}
            className={`rounded px-4 py-2 ${
              sortBy === "createdAt"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Ordenar por Data de Criação
          </button>
        </div>

        {loading ? (
          <div className="text-center">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sortedInstitutions.length === 0 ? (
              <div className="text-center">Nenhuma instituição encontrada.</div>
            ) : (
              sortedInstitutions.map((institution) => (
                <div
                  key={institution.id}
                  className="flex items-center justify-between rounded-lg bg-white p-4 shadow"
                >
                  <span>
                    {institution.title} ({institution.userCount} usuários)
                  </span>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          onClick={() => {
                            setEditingInstitution(institution);
                            setNewInstitutionTitle(institution.title);
                          }}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Editando: {editingInstitution?.title || institution.title}
                          </DialogTitle>
                          <DialogDescription>
                            Altere o título da instituição conforme necessário.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <input
                            type="text"
                            placeholder="Novo título da instituição"
                            value={newInstitutionTitle}
                            onChange={(e) => setNewInstitutionTitle(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <DialogClose asChild>
                            <button className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400">
                              Cancelar
                            </button>
                          </DialogClose>
                          <button
                            onClick={handleUpdateInstitution}
                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                          >
                            Salvar
                          </button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <button
                      onClick={() => handleDeleteInstitution(institution.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionManagement;