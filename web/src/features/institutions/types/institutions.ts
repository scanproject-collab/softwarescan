import { SearchFilters } from '../../../shared/types';

/**
 * Interface para instituição
 */
export interface Institution {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  userCount?: number;
  author?: {
    id: string;
    name?: string;
    email?: string;
  };
}

/**
 * Interface para filtros de instituição
 */
export interface InstitutionFilters extends SearchFilters {
  title?: string;
}

/**
 * Interface para criação de instituição
 */
export interface CreateInstitutionDto {
  title: string;
}

/**
 * Interface para atualização de instituição
 */
export interface UpdateInstitutionDto {
  title: string;
} 