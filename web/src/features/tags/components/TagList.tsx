import React from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { Tag } from '../types/tag.types';

interface TagListProps {
  tags: Tag[];
  filterText: string;
  onEdit: (tag: Tag) => void;
  onDelete: (name: string) => void;
}

const TagList: React.FC<TagListProps> = ({ tags, filterText, onEdit, onDelete }) => {
  const filteredTags = filterText
    ? tags.filter(tag => tag.name.toLowerCase().includes(filterText.toLowerCase()))
    : tags;

  if (filteredTags.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma tag encontrada.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {filteredTags.map((tag) => (
        <div
          key={tag.id}
          className="flex items-center justify-between rounded-lg bg-white p-4 shadow"
        >
          <div className="flex flex-1 flex-col">
            <span className="font-medium">{tag.name || "Nome da tag não disponível"}</span>
            <span className="text-sm text-gray-500">
              Peso: {tag.weight || "Não definido"}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(tag)}
              className="text-blue-500 hover:text-blue-700"
              title="Editar tag"
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(tag.name)}
              className="text-red-500 hover:text-red-700"
              title="Excluir tag"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TagList; 