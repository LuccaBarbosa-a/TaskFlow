import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: string;
  name: string;
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET nao definido. Configure o arquivo .env.');
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: '7d' });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token nao fornecido. Faca login novamente.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
    req.userId = decoded.id;
    req.userName = decoded.name;
    next();
  } catch {
    res.status(403).json({ error: 'Token invalido ou expirado. Faca login novamente.' });
  }
}
