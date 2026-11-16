import { apiClient } from '@/lib/api-client';

export interface OrderItem {
  id: string;
  quantity: number;
  priceAtSale: string;
  variant: {
    sku: string;
    attributes: Record<string, string>;
    product: { id: string; name: string };
  };
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  notes?: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  shippingAddress?: ShippingAddress | null;
  user?: { id: string; email: string; firstName: string; lastName: string };
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
  shippingAddress: ShippingAddress;
}

export async function createOrder(payload: CreateOrderPayload) {
  const { data } = await apiClient.post<Order>('/orders', payload);
  return data;
}

export async function getAllOrders() {
  const { data } = await apiClient.get<Order[]>('/orders');
  return data;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { data } = await apiClient.patch<Order>(`/orders/${orderId}/status`, {
    status,
  });
  return data;
}