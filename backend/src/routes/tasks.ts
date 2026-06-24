import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { authMiddleware } from '../middleware/auth';
import {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  PRIORITIES,
  CATEGORIES,
  STATUSES,
} from '../validation/schemas';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const { priority, category, status, search } = req.query;

    const where: Prisma.TaskWhereInput = { userId };
    if (typeof priority === 'string' && (PRIORITIES as readonly string[]).includes(priority)) {
      where.priority = priority as Prisma.TaskWhereInput['priority'];
    }
    if (typeof category === 'string' && (CATEGORIES as readonly string[]).includes(category)) {
      where.category = category as Prisma.TaskWhereInput['category'];
    }
    if (typeof status === 'string' && (STATUSES as readonly string[]).includes(status)) {
      where.status = status as Prisma.TaskWhereInput['status'];
    }
    if (typeof search === 'string' && search.trim()) {
      where.title = { contains: search.trim(), mode: 'insensitive' };
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const [total, concluidas, pendentes, em_andamento, urgentes] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'concluida' } }),
      prisma.task.count({ where: { userId, status: 'pendente' } }),
      prisma.task.count({ where: { userId, status: 'em_andamento' } }),
      prisma.task.count({ where: { userId, priority: 'alta', status: { not: 'concluida' } } }),
    ]);

    return res.json({
      tasks,
      stats: { total, concluidas, pendentes, em_andamento, urgentes },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao buscar tarefas.' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { title, description, priority, category, status, due_date } = parsed.data;

    const task = await prisma.task.create({
      data: {
        userId: req.userId as string,
        title,
        description,
        priority,
        category,
        status,
        due_date: due_date ?? null,
      },
    });

    return res.status(201).json({ message: 'Tarefa criada!', task });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar tarefa.' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const result = await prisma.task.updateMany({
      where: { id: req.params.id, userId: req.userId as string },
      data: parsed.data,
    });
    if (result.count === 0) {
      return res.status(404).json({ error: 'Tarefa nao encontrada.' });
    }

    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    return res.json({ message: 'Tarefa atualizada!', task });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao atualizar tarefa.' });
  }
});

router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Status invalido.' });
    }

    const result = await prisma.task.updateMany({
      where: { id: req.params.id, userId: req.userId as string },
      data: { status: parsed.data.status },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: 'Tarefa nao encontrada.' });
    }

    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    return res.json({ message: 'Status atualizado!', task });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao atualizar status.' });
  }
});

router.delete('/concluidas', async (req: Request, res: Response) => {
  try {
    const result = await prisma.task.deleteMany({
      where: { userId: req.userId, status: 'concluida' },
    });
    return res.json({ message: `${result.count} tarefas concluidas removidas.` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao deletar tarefas.' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await prisma.task.deleteMany({
      where: { id: req.params.id, userId: req.userId as string },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: 'Tarefa nao encontrada.' });
    }
    return res.json({ message: 'Tarefa deletada!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao deletar tarefa.' });
  }
});

export default router;
