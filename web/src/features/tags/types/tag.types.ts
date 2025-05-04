export interface Tag {
  id: string;
  name: string;
  weight: string | null;
  createdAt: string;
  updatedAt: string;
  usageCount?: number; // Number of posts using this tag
}

export interface TagResponse {
  message: string;
  tags: Tag[];
}

export interface TagFormData {
  name: string;
  weight: string;
} 