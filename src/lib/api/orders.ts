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

export interface CreateOrderPayload {
  items: { variantId: string; quantity: number }[];
}

export async function createOrder(payload: CreateOrderPayload) {
  const { data } = await apiClient.post<Order>('/orders', payload);
  return data;
}

export async function getAllOrders() {
  const { data } = await apiClient.get<Order[]>('/orders');
  return data;
}