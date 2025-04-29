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

interface Tag {
  id: string;
  name: string;
  weight: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TagResponse {
  message: string;
  tags: Tag[];
}

const TagManagement: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingTag, setEditingTag] = useState<{ name: string; weight: string | null } | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagWeight, setNewTagWeight] = useState("");
  const { token } = useAuth();

  const fetchTags = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api.get<TagResponse>("/tags", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tagList = response.data.tags || [];
      setTags(tagList);
    } catch (err) {
      toast.error("Erro ao carregar tags.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
    const interval = setInterval(fetchTags, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleCreateTag = async () => {
    if (!newTagName) {
      toast.error("O nome da tag não pode estar vazio.");
      return;
    }

    const capitalizedTagName = newTagName.charAt(0).toUpperCase() + newTagName.slice(1);

    try {
      await api.post(
        "/tags/create",
        { name: capitalizedTagName, weight: newTagWeight },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTagName("");
      setNewTagWeight("");
      toast.success("Tag criada com sucesso!");
      fetchTags();
    } catch (err) {
      toast.error("Erro ao criar tag.");
      console.error(err);
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !newTagName) {
      toast.error("O nome da tag não pode estar vazio.");
      return;
    }

    const capitalizedTagName = newTagName.charAt(0).toUpperCase() + newTagName.slice(1);

    try {
      await api.put(
        `/tags/${encodeURIComponent(editingTag.name)}`,
        { newName: capitalizedTagName, weight: newTagWeight || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingTag(null);
      setNewTagName("");
      setNewTagWeight("");
      toast.success("Tag atualizada com sucesso!");
      fetchTags();
    } catch (err) {
      toast.error("Erro ao atualizar tag.");
      console.error(err);
    }
  };

  const handleDeleteTag = async (name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a tag "${name}"?`)) {
      try {
        await api.delete(`/tags/${encodeURIComponent(name)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Tag excluída com sucesso!");
        fetchTags();
      } catch (err) {
        toast.error("Erro ao excluir tag.");
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Toaster />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciamento de Tags</h1>
          <button
            onClick={fetchTags}
            className="flex items-center gap-2 rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            <RefreshCw className="h-5 w-5" />
            Atualizar
          </button>
        </div>

        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Pesquisar tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <Dialog>
            <DialogTrigger asChild>
              <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Criar Tag
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Tag</DialogTitle>
                <DialogDescription>Preencha os dados da nova tag.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <input
                  type="text"
                  placeholder="Nome da tag"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  type="text"
                  placeholder="Peso da tag (obrigatorio)"
                  value={newTagWeight}
                  onChange={(e) => setNewTagWeight(e.target.value)}
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
                  onClick={handleCreateTag}
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Criar
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tags.length === 0 ? (
              <div className="text-center">Nenhuma tag encontrada.</div>
            ) : (
              tags.map((tag) => (
                <div
                  key={tag.id} // Use tag.id as the key since it's unique
                  className="flex items-center justify-between rounded-lg bg-white p-4 shadow"
                >
                  <span>{tag.name || "Nome da tag não disponível"}</span>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          onClick={() => {
                            setEditingTag({ name: tag.name, weight: tag.weight });
                            setNewTagName(tag.name);
                            setNewTagWeight(tag.weight || "");
                          }}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editando: {editingTag?.name || tag.name}</DialogTitle>
                          <DialogDescription>
                            Altere o nome ou o peso da tag conforme necessário.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <input
                            type="text"
                            placeholder="Novo nome da tag"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                          <input
                            type="text"
                            placeholder="Peso da tag (opcional)"
                            value={newTagWeight}
                            onChange={(e) => setNewTagWeight(e.target.value)}
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
                            onClick={handleUpdateTag}
                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                          >
                            Salvar
                          </button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <button
                      onClick={() => handleDeleteTag(tag.name)}
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

export default TagManagement;   