import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import styles from './TaskModal.module.css';
import type { Category, Priority, Status, Task, TaskPayload } from '../types';

interface TaskModalProps {
  task: Task | null;
  onSave: (data: TaskPayload) => Promise<void>;
  onClose: () => void;
}

export default function TaskModal({ task, onSave, onClose }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [category, setCategory] = useState<Category>('pessoal');
  const [status, setStatus] = useState<Status>('pendente');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'media');
      setCategory(task.category || 'pessoal');
      setStatus(task.status || 'pendente');
      setDueDate(task.due_date ? task.due_date.slice(0, 10) : '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('media');
      setCategory('pessoal');
      setStatus('pendente');
      setDueDate('');
    }
  }, [task]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({ title, description, priority, category, status, due_date: dueDate || null });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} fade-in`}>
        <div className={styles.header}>
          <h2>{task ? 'Editar tarefa' : 'Nova tarefa'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Título *</label>
            <input
              type="text"
              value={title}
              required
              autoFocus
              onChange={(e) => setTitle(e.target.value)}
              placeholder="O que precisa ser feito?"
            />
          </div>

          <div className={styles.field}>
            <label>Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes adicionais (opcional)"
              rows={3}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Prioridade</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                <option value="alta">🔴 Alta</option>
                <option value="media">🟡 Média</option>
                <option value="baixa">🟢 Baixa</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Categoria</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                <option value="faculdade">📚 Faculdade</option>
                <option value="trabalho">💼 Trabalho</option>
                <option value="pessoal">👤 Pessoal</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                <option value="pendente">⏳ Pendente</option>
                <option value="em_andamento">🔄 Em andamento</option>
                <option value="concluida">✅ Concluída</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Prazo</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={task ? undefined : new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving || !title.trim()}>
              {saving ? <span className="spinner" /> : task ? 'Salvar alterações' : 'Criar tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
