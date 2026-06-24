import axios from 'axios';
import type { AuthResponse, Status, Task, TaskPayload, TaskStats, User } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      window.dispatchEvent(new Event('taskflow:logout'));
      window.location.href = '/login';
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
