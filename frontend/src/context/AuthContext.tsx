import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('taskflow_user');
    const storedToken = localStorage.getItem('taskflow_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser) as User);
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string): Promise<User> {
    const res = await authService.login({ email, password });
    const { token, user: loggedUser } = res.data;
    localStorage.setItem('taskflow_token', token);
    localStorage.setItem('taskflow_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  }

  async function register(name: string, email: string, password: string): Promise<User> {
    const res = await authService.register({ name, email, password });
    const { token, user: newUser } = res.data;
    localStorage.setItem('taskflow_token', token);
    localStorage.setItem('taskflow_user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  }

  function logout(): void {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
