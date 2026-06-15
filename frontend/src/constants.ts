import type { Priority, Category, Status } from './types';

export const PRIORITY_LABELS: Record<Priority, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  faculdade: 'Faculdade',
  trabalho: 'Trabalho',
  pessoal: 'Pessoal',
};

export const STATUS_LABELS: Record<Status, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  faculdade: '📚',
  trabalho: '💼',
  pessoal: '👤',
};

export const STATUS_NEXT: Record<Status, Status> = {
  pendente: 'em_andamento',
  em_andamento: 'concluida',
  concluida: 'pendente',
};
