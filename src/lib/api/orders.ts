import { apiClient } from '@/lib/api-client';

export interface OrderItem {
  id: string;
  quantity: number;
  priceAtSale: string;
  variant: {
    sku: string;
    attributes: Record<string, string>;
    product: { name: string };
  };
}

export interface Order {
  id: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  items: OrderItem[];
}

export async function getMyOrders() {
  const { data } = await apiClient.get<Order[]>('/orders/my-orders');
  return data;
}
