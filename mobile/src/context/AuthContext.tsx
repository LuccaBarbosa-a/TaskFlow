import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser(): Promise<void> {
      try {
        const stored = await SecureStore.getItemAsync('taskflow_user');
        const token = await SecureStore.getItemAsync('taskflow_token');
        if (stored && token) setUser(JSON.parse(stored) as User);
      } catch (err) {
        console.warn('Falha ao carregar sessao salva:', err);
      } finally {
        setLoading(false);
      }
    }
    void loadUser();
  }, []);

  async function login(email: string, password: string): Promise<User> {
    const res = await authService.login({ email, password });
    const { token, user: loggedUser } = res.data;
    await SecureStore.setItemAsync('taskflow_token', token);
    await SecureStore.setItemAsync('taskflow_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  }

  async function register(name: string, email: string, password: string): Promise<User> {
    const res = await authService.register({ name, email, password });
    const { token, user: newUser } = res.data;
    await SecureStore.setItemAsync('taskflow_token', token);
    await SecureStore.setItemAsync('taskflow_user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  }

  async function logout(): Promise<void> {
    await SecureStore.deleteItemAsync('taskflow_token');
    await SecureStore.deleteItemAsync('taskflow_user');
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
