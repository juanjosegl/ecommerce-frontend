import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  },
);

/** HTTP status of a failed API call, or undefined for network errors. */
export function httpStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

/** Backend error message (NestJS shape), if the API sent one. */
export function apiMessage(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const message = (error.response?.data as { message?: string | string[] })?.message;
  return Array.isArray(message) ? message[0] : message;
}
