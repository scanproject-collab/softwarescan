import React from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Interaction } from '../types/interactions';

interface ExportButtonProps {
  interactions: Interaction[];
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ interactions, disabled = false }) => {
  const handleExport = () => {
    if (interactions.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(
      interactions.map((interaction) => ({
        Título: interaction.title || 'Sem título',
        Conteúdo: interaction.content || 'Sem conteúdo',
        Tags: interaction.tags?.join(', ') || 'Sem tags',
        Prioridade: interaction.ranking || 'Não definida',
        Peso: interaction.weight || '0',
        'Data de Criação': new Date(interaction.createdAt || '').toLocaleString(),
        Autor: interaction.author?.name || 'Desconhecido',
        Email: interaction.author?.email || 'Sem email',
        Instituição: interaction.author?.institution?.title || 'Sem instituição',
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Interações');
    XLSX.writeFile(workbook, `interacoes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || interactions.length === 0}
      className={`flex items-center gap-2 rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700 ${disabled || interactions.length === 0 ? 'cursor-not-allowed opacity-50' : ''
        }`}
    >
      <Download className="h-4 w-4" />
      Exportar
    </button>
  );
};

