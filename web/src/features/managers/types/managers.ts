import { SearchFilters, UserRole } from '../../../shared/types';

/**
 * Interface para gerente
 */
export interface Manager {
  id: string;
  name: string;
  email: string;
  role: UserRole.MANAGER;
  createdAt: string;
  updatedAt: string;
  lastLoginDate?: string;
  institution: {
    id: string;
    title: string;
  } | null;
}

/**
 * Interface para filtros de gerente
 */
export interface ManagerFilters extends SearchFilters {
  name?: string;
  email?: string;
  institutionId?: string;
}

/**
 * Interface para criação de gerente
 */
export interface CreateManagerDto {
  name: string;
  email: string;
  password: string;
  institutionId?: string;
  verificationCode?: string;
  role: UserRole.MANAGER;
}

/**
 * Interface para atualização da instituição do gerente
 */
export interface UpdateManagerInstitutionDto {
  institutionId: string | null;
} 