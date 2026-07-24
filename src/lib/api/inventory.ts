import { apiClient } from '@/lib/api-client';

export interface LowStockVariant {
  id: string;
  sku: string;
  stock: number;
  attributes: Record<string, string>;
  product: { name: string };
}

export async function getLowStockVariants(threshold?: number) {
  const { data } = await apiClient.get<LowStockVariant[]>(
    '/inventory/low-stock',
    { params: threshold ? { threshold } : undefined },
  );
  return data;
}

export interface InventoryMovement {
  id: string;
  variantId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  createdBy: string | null;
  createdAt: string;
}

export interface CreateMovementPayload {
  variantId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
}

export async function createMovement(payload: CreateMovementPayload) {
  const { data } = await apiClient.post<InventoryMovement>(
    '/inventory/movements',
    payload,
  );
  return data;
}

export async function getMovementsByVariant(variantId: string) {
  const { data } = await apiClient.get<InventoryMovement[]>(
    `/inventory/movements/${variantId}`,
  );
  return data;
}