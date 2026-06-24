import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import type { AuthResponse, Status, Task, TaskPayload, TaskStats, User } from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('taskflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedCallback(cb: () => void): void {
  onUnauthorized = cb;
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
      await SecureStore.deleteItemAsync('taskflow_token');
      await SecureStore.deleteItemAsync('taskflow_user');
      onUnauthorized?.();
    }
    return Promise.reject(err);
  },
);

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { error?: string } | undefined)?.error ?? fallback;
  }
  return fallback;
}

interface TaskListResponse {
  tasks: Task[];
  stats: TaskStats;
}

interface TaskMutationResponse {
  message: string;
  task: Task;
}

interface MessageResponse {
  message: string;
}

export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post<AuthResponse>('/auth/login', data),
  me: () => api.get<{ user: User }>('/auth/me'),
};

export const taskService = {
  list: (params?: Record<string, string>) => api.get<TaskListResponse>('/tasks', { params }),
  create: (data: TaskPayload) => api.post<TaskMutationResponse>('/tasks', data),
  update: (id: string, data: TaskPayload) => api.put<TaskMutationResponse>(`/tasks/${id}`, data),
  updateStatus: (id: string, status: Status) =>
    api.patch<TaskMutationResponse>(`/tasks/${id}/status`, { status }),
  delete: (id: string) => api.delete<MessageResponse>(`/tasks/${id}`),
  deleteConcluidas: () => api.delete<MessageResponse>('/tasks/concluidas'),
};

export default api;
