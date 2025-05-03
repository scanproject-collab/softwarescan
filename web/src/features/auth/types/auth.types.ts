export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  institutionId?: string;
  institution?: {
    id: string;
    title: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PasswordRecoveryData {
  email: string;
}

export interface PasswordResetData {
  code: string;
  password: string;
} 