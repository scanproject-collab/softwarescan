export interface Tag {
  id: string;
  name: string;
  weight: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TagResponse {
  message: string;
  tags: Tag[];
}

export interface TagFormData {
  name: string;
  weight: string;
} 