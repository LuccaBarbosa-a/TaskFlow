import { useState } from 'react';
import styles from './TaskCard.module.css';
import type { Status, Task } from '../types';
import { CATEGORY_ICONS, PRIORITY_LABELS, STATUS_LABELS, STATUS_NEXT } from '../constants';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: Status) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

function formatDate(str: string | null): string | null {
  if (!str) return null;
  const d = new Date(str);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const [delConfirm, setDelConfirm] = useState(false);

  const isOverdue =
    !!task.due_date && task.status !== 'concluida' && new Date(task.due_date) < new Date();

  function handleDelete(): void {
    if (!delConfirm) {
      setDelConfirm(true);
      setTimeout(() => setDelConfirm(false), 3000);
      return;
    }
    onDelete(task.id);
  }

  return (
    <div className={`${styles.card} ${task.status === 'concluida' ? styles.done : ''} fade-in`}>
      {/* Linha de prioridade */}
      <div className={`${styles.priorityBar} ${styles[task.priority]}`} />

      <div className={styles.body}>
        {/* Checkbox de status */}
        <button
          className={`${styles.check} ${task.status === 'concluida' ? styles.checked : ''}`}
          onClick={() => onStatusChange(task.id, STATUS_NEXT[task.status])}
          title={`Mudar para: ${STATUS_LABELS[STATUS_NEXT[task.status]]}`}
        >
          {task.status === 'concluida' && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="2,6 5,9 10,3" />
            </svg>
          )}
          {task.status === 'em_andamento' && <div className={styles.halfFill} />}
        </button>

        <div className={styles.content}>
          <p className={styles.title}>{task.title}</p>
          {task.description && <p className={styles.description}>{task.description}</p>}
          <div className={styles.meta}>
            <span className={`${styles.badge} ${styles[task.priority]}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
            <span className={styles.category}>
              {CATEGORY_ICONS[task.category]} {task.category}
            </span>
            <span className={`${styles.status} ${styles['s_' + task.status]}`}>
              {STATUS_LABELS[task.status]}
            </span>
            {task.due_date && (
              <span className={`${styles.date} ${isOverdue ? styles.overdue : ''}`}>
                📅 {formatDate(task.due_date)}
                {isOverdue && ' (atrasada)'}
              </span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => onEdit(task)} title="Editar">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
            </svg>
          </button>
          <button
            className={`${styles.iconBtn} ${delConfirm ? styles.dangerConfirm : styles.danger}`}
            onClick={handleDelete}
            title={delConfirm ? 'Clique novamente para confirmar' : 'Deletar'}
          >
            {delConfirm ? (
              '✓?'
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
