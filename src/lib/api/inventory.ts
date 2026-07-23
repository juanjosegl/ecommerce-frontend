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