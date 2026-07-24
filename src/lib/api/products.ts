import { apiClient } from "@/lib/api-client";

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
  const { data } = await apiClient.get<Product[]>("/products", {
    params: categoryId ? { categoryId } : undefined,
  });
  return data;
}

export async function getProductById(id: string) {
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
}

export interface CreateVariantPayload {
  sku: string;
  attributes: Record<string, string>;
  price: number;
  initialStock?: number;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  categoryId: string;
  variants: CreateVariantPayload[];
}

export async function createProduct(payload: CreateProductPayload) {
  const { data } = await apiClient.post<Product>("/products", payload);
  return data;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  categoryId?: string;
  isActive?: boolean;
}

export async function updateProduct(id: string, payload: UpdateProductPayload) {
  const { data } = await apiClient.patch<Product>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: string) {
  await apiClient.delete(`/products/${id}`);
}

export async function addVariant(
  productId: string,
  payload: { sku: string; attributes: Record<string, string>; price: number },
) {
  const { data } = await apiClient.post<ProductVariant>(
    `/products/${productId}/variants`,
    payload,
  );
  return data;
}

export async function updateVariant(
  variantId: string,
  payload: Partial<{
    attributes: Record<string, string>;
    price: number;
    isActive: boolean;
  }>,
) {
  const { data } = await apiClient.patch<ProductVariant>(
    `/products/variants/${variantId}`,
    payload,
  );
  return data;
}

export async function addProductImage(
  productId: string,
  payload: { url: string; order?: number; variantId?: string },
) {
  const { data } = await apiClient.post<ProductImage>(
    `/products/${productId}/images`,
    payload,
  );
  return data;
}

export async function removeProductImage(imageId: string) {
  await apiClient.delete(`/products/images/${imageId}`);
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<{ url: string }>(
    "/uploads/image",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.url;
}
