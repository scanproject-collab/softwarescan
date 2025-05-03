import React from 'react';
import { Button } from '../../../shared/components/ui/Button';
import { Interaction, InteractionStatus } from '../types/interactions';
import { formatDateForExport } from '../../../shared/utils/excelExport';

interface InteractionCardProps {
  interaction: Interaction;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
}

/**
 * Componente para exibir um card de interação
 */
export const InteractionCard: React.FC<InteractionCardProps> = ({
  interaction,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  /**
   * Retorna cor baseada no status da interação
   */
  const getStatusColor = (status: InteractionStatus) => {
    switch (status) {
      case InteractionStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case InteractionStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case InteractionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case InteractionStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Traduz o status para português
   */
  const getStatusText = (status: InteractionStatus) => {
    switch (status) {
      case InteractionStatus.PENDING:
        return 'Pendente';
      case InteractionStatus.IN_PROGRESS:
        return 'Em Andamento';
      case InteractionStatus.COMPLETED:
        return 'Concluído';
      case InteractionStatus.CANCELLED:
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 truncate" title={interaction.title}>
          {interaction.title}
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interaction.status)}`}
        >
          {getStatusText(interaction.status)}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={interaction.description}>
        {interaction.description}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {interaction.tags.map((tag) => (
          <span
            key={tag.id}
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${tag.color}25`, color: tag.color }}
          >
            {tag.name}
          </span>
        ))}
      </div>

      <div className="text-xs text-gray-500 mb-3">
        <div className="flex justify-between">
          <span>Operador:</span>
          <span className="font-medium">{interaction.operator.name}</span>
        </div>
        <div className="flex justify-between">
          <span>Criado em:</span>
          <span>{formatDateForExport(interaction.createdAt)}</span>
        </div>
        {interaction.location && (
          <div className="flex justify-between">
            <span>Localização:</span>
            <span className="truncate max-w-[150px]" title={interaction.location.address}>
              {interaction.location.address || 'Sem endereço'}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between gap-2 mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(interaction.id)}
        >
          Detalhes
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(interaction.id)}
          >
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(interaction.id)}
          >
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
}; 