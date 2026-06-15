import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../services/api';
import styles from './Auth.module.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      toast.error('Senha mínima de 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Conta criada! Bem-vindo ao TaskFlow!');
      navigate('/');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erro ao criar conta.'));
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

        <h1 className={styles.title}>Criar conta grátis</h1>
        <p className={styles.subtitle}>Comece a organizar suas tarefas agora</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>
          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className={styles.field}>
            <label>
              Senha{' '}
              <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(mín. 6 caracteres)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Criar conta'}
          </button>
        </form>

        <p className={styles.link}>
          Já tem conta? <Link to="/login">Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
