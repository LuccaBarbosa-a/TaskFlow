// Estende o objeto Request do Express com os dados do usuario autenticado,
// preenchidos pelo authMiddleware apos validar o token JWT.
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userName?: string;
    }
  }
}

export {};
