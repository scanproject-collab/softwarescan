import { SearchFilters } from '../../../shared/types';

/**
 * Interface de uma interação
 */
export interface Author {
  id: string;
  name?: string;
  email?: string;
  institution?: {
    id: string;
    title: string;
  };
}

export interface Interaction {
  id: string;
  title?: string;
  content?: string;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  ranking?: string;
  weight?: number | string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  author: Author;
}

/**
 * Enum para status de interação
 */
export enum InteractionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Interface para filtros de interação
 */
export interface InteractionFilters extends SearchFilters {
  startDate?: string;
  endDate?: string;
  tagIds?: string[];
  operatorIds?: string[];
  status?: InteractionStatus;
}

/**
 * Interface para criação de interação
 */
export interface CreateInteractionDto {
  title: string;
  description: string;
  operatorId: string;
  tagIds: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

/**
 * Interface para atualização de interação
 */
export interface UpdateInteractionDto {
  title?: string;
  description?: string;
  status?: InteractionStatus;
  operatorId?: string;
  tagIds?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
} 