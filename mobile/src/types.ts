export type Priority = 'alta' | 'media' | 'baixa';
export type Category = 'faculdade' | 'trabalho' | 'pessoal';
export type Status = 'pendente' | 'em_andamento' | 'concluida';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  status: Status;
  due_date: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  concluidas: number;
  pendentes: number;
  em_andamento: number;
  urgentes: number;
}

export interface TaskPayload {
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  status: Status;
  due_date?: string | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}
