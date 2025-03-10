import React, { useState, useEffect } from "react";
import api from "../../services/api.ts";
import { useAuth } from "../../hooks/useAuth.ts";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../components/Navbar.tsx";
import { Trash2 } from "lucide-react";

const TagManagement: React.FC = () => {
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();

    const fetchTags = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await api.get("/tags", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTags(response.data.tags || []);
        } catch (err) {
            toast.error("Erro ao carregar tags.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTag = async () => {
        if (!newTag.trim()) {
            toast.error("O nome da tag não pode estar vazio.");
            return;
        }

        try {
            await api.post(
                "/tags/create",
                { name: newTag.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewTag("");
            fetchTags();
            toast.success("Tag criada com sucesso!");
        } catch (err) {
            toast.error("Erro ao criar tag.");
            console.error(err);
        }
    };

    const handleDeleteTag = async (name: string) => {
        if (window.confirm(`Tem certeza que deseja excluir a tag "${name}"?`)) {
            try {
                await api.delete(`/tags/${name}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                fetchTags();
                toast.success("Tag excluída com sucesso!");
            } catch (err) {
                toast.error("Erro ao excluir tag.");
                console.error(err);
            }
        }
    };

    useEffect(() => {
        fetchTags();
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Toaster />

            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Gerenciamento de Tags</h1>

                <div className="mb-6 flex gap-4">
                    <input
                        type="text"
                        placeholder="Digite o nome da nova tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <button
                        onClick={handleCreateTag}
                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        Criar Tag
                    </button>
                </div>

                {loading ? (
                    <div className="text-center">Carregando...</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {tags.map((tag) => (
                            <div
                                key={tag}
                                className="flex items-center justify-between rounded-lg bg-white p-4 shadow"
                            >
                                <span>{tag}</span>
                                <button
                                    onClick={() => handleDeleteTag(tag)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TagManagement;