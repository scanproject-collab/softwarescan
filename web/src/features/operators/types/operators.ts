import { SearchFilters, UserRole } from '../../../shared/types';

/**
 * Interface para operador
 */
export interface Operator {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: OperatorStatus;
  createdAt: string;
  updatedAt: string;
  role: UserRole.OPERATOR;
  institutionId?: string;
  institution?: {
    id: string;
    name: string;
  };
  tags?: {
    id: string;
    name: string;
    color: string;
  }[];
  metadata?: Record<string, any>;
}

/**
 * Enum para status de operador
 */
export enum OperatorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  INACTIVE = 'INACTIVE',
}

/**
 * Interface para filtros de operador
 */
export interface OperatorFilters extends SearchFilters {
  status?: OperatorStatus;
  institutionId?: string;
  tagIds?: string[];
}

/**
 * Interface para criação de operador
 */
export interface CreateOperatorDto {
  name: string;
  email: string;
  phone?: string;
  password: string;
  institutionId?: string;
  tagIds?: string[];
}

/**
 * Interface para atualização de operador
 */
export interface UpdateOperatorDto {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  status?: OperatorStatus;
  institutionId?: string;
  tagIds?: string[];
} 