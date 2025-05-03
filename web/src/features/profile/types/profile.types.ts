export interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  institution?: {
    id: string;
    title: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileUpdateData {
  name: string;
  email: string;
  password?: string;
  currentPassword?: string;
} 