export interface Interaction {
  id: string;
  weight?: string | number;
  title?: string;
  imageUrl?: string;
  createdAt?: string | Date;
  content?: string;
  latitude?: number;
  longitude?: number;
  tags?: string[];
  ranking?: string; // Made optional to accommodate both definitions
  author: {
    id: string;
    name?: string; // Optional to match App.tsx and be more flexible
    email?: string;
    institution?: {
      id: string;
      title?: string;
    };
  };
}