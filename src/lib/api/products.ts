import { apiClient } from '@/lib/api-client';

export interface ProductVariant {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  price: string;
  stock: number;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  order: number;
  variantId: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  variants: ProductVariant[];
  images: ProductImage[];
}

export async function getProducts(categoryId?: string) {
  const { data } = await apiClient.get<Product[]>('/products', {
    params: categoryId ? { categoryId } : undefined,
  });
  return data;
}

export async function getProductById(id: string) {
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
}