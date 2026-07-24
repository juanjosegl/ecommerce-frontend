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

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  parentId?: string;
}

export async function createCategory(payload: CreateCategoryPayload) {
  const { data } = await apiClient.post<Category>('/categories', payload);
  return data;
}

export async function updateCategory(
  id: string,
  payload: Partial<CreateCategoryPayload>,
) {
  const { data } = await apiClient.patch<Category>(
    `/categories/${id}`,
    payload,
  );
  return data;
}

export async function deleteCategory(id: string) {
  await apiClient.delete(`/categories/${id}`);
}