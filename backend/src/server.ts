import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { prisma } from './db/prisma';
import authRoutes from './routes/auth';
import tasksRoutes from './routes/tasks';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(helmet());
app.use(cors({ origin: corsOrigins }));
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
    next();
  });
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

const tasksLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisicoes. Tente novamente em breve.' },
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tasks', tasksLimiter, tasksRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'TaskFlow API rodando!', timestamp: new Date().toISOString() });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota nao encontrada.' });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Erro nao tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

async function start(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL');

    app.listen(PORT, () => {
      console.log(`\n🚀 TaskFlow API rodando em http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('❌ Falha ao conectar ao banco de dados:', err);
    process.exit(1);
  }
}

start();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
