import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { DialogTrigger } from "../../../components/ui/dialog";
import { Tag, TagFormData } from "../types/tag.types";
import { useTags } from "../hooks/useTags";

import TagList from "./TagList";
import TagForm from "./TagForm";
import MainLayout from "../../../layouts/MainLayout";

const TagManagementScreen: React.FC = () => {
  const { tags, loading, fetchTags, createTag, updateTag, deleteTag } = useTags();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const handleCreateTag = async (data: TagFormData) => {
    if (!data.name) {
      return;
    }

    const success = await createTag(data);
    if (success) {
      setIsCreateModalOpen(false);
    }
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setIsEditModalOpen(true);
  };

  const handleUpdateTag = async (data: TagFormData) => {
    if (!editingTag || !data.name) {
      return;
    }

    const success = await updateTag(editingTag.name, data);
    if (success) {
      setIsEditModalOpen(false);
      setEditingTag(null);
    }
  };

  const handleDeleteTag = async (name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a tag "${name}"?`)) {
      await deleteTag(name);
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <Toaster />
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Criar Tag
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">Carregando...</div>
        ) : (
          <TagList
            tags={tags}
            filterText={searchQuery}
            onEdit={handleEditTag}
            onDelete={handleDeleteTag}
          />
        )}

        {/* Modal de Criação */}
        <TagForm
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTag}
          title="Nova Tag"
          description="Preencha os dados da nova tag."
          submitButtonText="Criar"
        />

        {/* Modal de Edição */}
        {editingTag && (
          <TagForm
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingTag(null);
            }}
            onSubmit={handleUpdateTag}
            initialData={editingTag}
            title={`Editando: ${editingTag.name}`}
            description="Altere o nome ou o peso da tag conforme necessário."
            submitButtonText="Atualizar"
          />
        )}
      </div>
    </MainLayout>
  );
};

export default TagManagementScreen; 