import { z } from 'zod';

export const PRIORITIES = ['alta', 'media', 'baixa'] as const;
export const CATEGORIES = ['faculdade', 'trabalho', 'pessoal'] as const;
export const STATUSES = ['pendente', 'em_andamento', 'concluida'] as const;

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.string().trim().toLowerCase().email('Email invalido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email invalido.'),
  password: z.string().min(1, 'A senha e obrigatoria.'),
});

const dueDate = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v === undefined ? undefined : v === null ? null : new Date(v)));

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'O titulo da tarefa e obrigatorio.'),
  description: z.string().optional().default(''),
  priority: z.enum(PRIORITIES).optional().default('media'),
  category: z.enum(CATEGORIES).optional().default('pessoal'),
  status: z.enum(STATUSES).optional().default('pendente'),
  due_date: dueDate,
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1, 'O titulo nao pode estar vazio.').optional(),
  description: z.string().optional(),
  priority: z.enum(PRIORITIES).optional(),
  category: z.enum(CATEGORIES).optional(),
  status: z.enum(STATUSES).optional(),
  due_date: dueDate,
});

export const updateStatusSchema = z.object({
  status: z.enum(STATUSES),
});
