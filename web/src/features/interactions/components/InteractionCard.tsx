import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { MapPin, User, Calendar } from 'lucide-react';
import { formatDate } from '../../../shared/utils/dateFormat';
import { Badge } from '../../../components/ui/badge';

// Define the Tag type
interface Tag {
  id: string;
  name: string;
  color: string;
}

// Define the Operator type
interface Operator {
  id: string;
  name: string;
}

// Define the Location type
interface Location {
  address: string;
}

// Update the Interaction type
interface Interaction {
  id: string;
  title: string;
  status?: string;
  description?: string;
  createdAt: string;
  tags?: Tag[];
  operator?: Operator;
  location?: Location;
}

interface InteractionCardProps {
  interaction: Interaction;
  onClick: () => void;
}

// Status helper functions
const getStatusColor = (status?: string) => {
  if (!status) return 'bg-gray-100 text-gray-800';

  switch (status.toLowerCase()) {
    case 'aberto':
      return 'bg-green-100 text-green-800';
    case 'em progresso':
      return 'bg-blue-100 text-blue-800';
    case 'fechado':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status?: string) => {
  return status || 'Não definido';
};

export const InteractionCard: React.FC<InteractionCardProps> = ({ interaction, onClick }) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-base text-gray-800 line-clamp-1">{interaction.title}</h3>
          <Badge
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interaction.status)}`}
            variant="outline"
          >
            {getStatusText(interaction.status)}
          </Badge>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={interaction.description || ''}>
          {interaction.description || 'Sem descrição'}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {interaction.tags && interaction.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-block px-2 py-1 rounded-full text-xs"
              style={{ backgroundColor: `${tag.color}25`, color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>

        <div className="text-sm text-gray-500 flex items-center mb-1">
          <User className="w-4 h-4 mr-1" />
          <span className="font-medium">{interaction.operator?.name || 'Não atribuído'}</span>
        </div>

        <div className="text-sm text-gray-500 flex items-center mb-1">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{formatDate(interaction.createdAt)}</span>
        </div>

        {interaction.location && (
          <div className="text-sm text-gray-500 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="truncate max-w-[150px]" title={interaction.location.address}>
              {interaction.location.address || 'Sem endereço'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 