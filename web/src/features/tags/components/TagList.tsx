import React from 'react';
import { Trash2, Pencil, BarChart2 } from 'lucide-react';
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

  // Função para gerar cor baseada no nome da tag
  const getTagColor = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-red-100 text-red-800 border-red-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200'
    ];

    // Usar o código do nome para garantir que tags iguais tenham a mesma cor
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // Função para formatar o peso
  const formatWeight = (weight: string | null) => {
    if (!weight) return 0;

    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) return 0;

    if (numWeight >= 1000) {
      return `${(numWeight / 1000).toFixed(1)}K`;
    }
    return numWeight;
  };

  if (filteredTags.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma tag encontrada.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {filteredTags.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          {filterText
            ? "Nenhuma tag encontrada com o termo pesquisado."
            : "Nenhuma tag cadastrada."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Peso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Uso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTags.map((tag) => (
                <tr key={tag.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag.name)} border`}>
                        {tag.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${parseFloat(tag.weight || '0') >= 50 ? 'bg-orange-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(100, (parseFloat(tag.weight || '0') / 100) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">{formatWeight(tag.weight)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BarChart2 className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-600">
                        {tag.usageCount || 0} posts
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(tag)}
                        className="rounded-md bg-blue-100 p-1 text-blue-700 hover:bg-blue-200 transition"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(tag.name)}
                        className="rounded-md bg-red-100 p-1 text-red-700 hover:bg-red-200 transition"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TagList; 