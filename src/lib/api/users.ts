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

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'ADMIN' | 'CUSTOMER';
}

export async function createUser(payload: CreateUserPayload) {
  const { data } = await apiClient.post<AdminUser>('/users', payload);
  return data;
}

export async function updateUserRole(id: string, role: 'ADMIN' | 'CUSTOMER') {
  const { data } = await apiClient.patch<AdminUser>(`/users/${id}`, { role });
  return data;
}

export async function deactivateUser(id: string) {
  const { data } = await apiClient.delete<AdminUser>(`/users/${id}`);
  return data;
}