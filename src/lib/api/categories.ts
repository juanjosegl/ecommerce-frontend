import { apiClient } from '@/lib/api-client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  children?: Category[];
  _count?: { products: number };
}

export async function getCategories() {
  const { data } = await apiClient.get<Category[]>('/categories');
  return data;
}