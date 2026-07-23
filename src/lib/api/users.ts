import { apiClient } from '@/lib/api-client';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  provider: string;
  isActive: boolean;
  createdAt: string;
}

export async function getUsers() {
  const { data } = await apiClient.get<AdminUser[]>('/users');
  return data;
}