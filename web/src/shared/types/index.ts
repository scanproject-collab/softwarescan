/**
 * Tipos globais compartilhados entre features
 */

// Tipo de usuário
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  institutionId?: string;
}

// Papéis de usuário
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR'
}

// Resposta padrão da API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// Erros da API
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Paginação
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filtros de pesquisa
export interface SearchFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
} 