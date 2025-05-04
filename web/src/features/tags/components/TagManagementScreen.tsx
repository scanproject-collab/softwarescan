import React, { useState, useEffect } from "react";
import { RefreshCw, Plus, Search } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Tag, TagFormData } from "../types/tag.types";
import { useTags } from "../hooks/useTags";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

import TagList from "./TagList";
import TagForm from "./TagForm";
import MainLayout from "../../../layouts/MainLayout";

const TagManagementScreen: React.FC = () => {
  const { tags, loading, fetchTags, createTag, updateTag, deleteTag } = useTags();
  const [initialLoad, setInitialLoad] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  useEffect(() => {
    // Set initialLoad to false after first loading completes
    if (!loading && initialLoad) {
      setInitialLoad(false);
    }
  }, [loading, initialLoad]);

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

  // Only show the full-page loading spinner on initial load
  const showFullLoading = loading && initialLoad;

  return (
    <MainLayout>
      <div className="p-6">
        <Toaster />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Tags</h1>
          <div className="flex gap-2">
            <button
              onClick={fetchTags}
              className="flex items-center gap-2 rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700 transition"
              disabled={loading}
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Pesquisar tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 pl-10 p-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
            />
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-md bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600 transition flex items-center gap-2"
            disabled={loading}
          >
            <Plus className="h-5 w-5" />
            Criar Tag
          </button>
        </div>

        {loading && !initialLoad && (
          <div className="mb-4 p-2 bg-blue-50 rounded">
            <LoadingSpinner size="sm" text="Atualizando dados..." color="blue" inline />
          </div>
        )}

        {showFullLoading ? (
          <div className="h-64">
            <LoadingSpinner size="lg" text="Carregando tags..." color="orange" />
          </div>
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