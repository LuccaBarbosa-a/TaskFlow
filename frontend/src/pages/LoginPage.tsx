import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../services/api';
import styles from './Auth.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha email e senha.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bem-vindo de volta!');
      navigate('/');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erro ao fazer login.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card + ' fade-in'}>
        <div className={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#5C3BCC" />
            <path
              d="M8 11h16M8 16h10M8 21h7"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="24" cy="20" r="4" fill="#FAC775" />
            <path
              d="M22.5 20l1 1 2-2"
              stroke="#5C3BCC"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={styles.logoText}>TaskFlow</span>
        </div>

        <h1 className={styles.title}>Entrar na sua conta</h1>
        <p className={styles.subtitle}>Organize seu dia com eficiência</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className={styles.field}>
            <label>Senha</label>
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Entrar'}
          </button>
        </form>

        <p className={styles.link}>
          Não tem conta? <Link to="/register">Criar conta grátis</Link>
        </p>
      </div>
    </div>
  );
}
