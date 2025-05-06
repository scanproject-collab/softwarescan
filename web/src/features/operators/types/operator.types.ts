export interface Operator {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  institution: string | { id: string; title: string };
  postsCount: number;
  createdAt: string;
  lastLoginDate?: string;
}

export interface OperatorPost {
  id: string;
  title: string;
  content?: string;
  createdAt: string;
  ranking: number | string | { id: string; title: string };
  tags?: any[];
  location?: string;
}

export interface OperatorDetails extends Operator {
  posts: OperatorPost[];
}

export interface FormData {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  institutionId?: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export interface PaginationMeta {
  page: number;
  total: number;
  pages: number;
  limit: number;
}

export interface FilterParams {
  search?: string;
  institutionId?: string;
  page: number;
  limit: number;
} 