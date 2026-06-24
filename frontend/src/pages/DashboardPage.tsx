import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage, taskService } from '../services/api';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';
import ThemeToggle from '../components/ThemeToggle';
import { CATEGORY_LABELS, PRIORITY_LABELS, STATUS_LABELS } from '../constants';
import type { Status, Task, TaskFilters, TaskPayload, TaskStats } from '../types';
import styles from './Dashboard.module.css';

const EMPTY_STATS: TaskStats = {
  total: 0,
  concluidas: 0,
  pendentes: 0,
  em_andamento: 0,
  urgentes: 0,
};

const EMPTY_FILTERS: TaskFilters = { priority: '', category: '', status: '', search: '' };

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filtros
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS);
  const [searchInput, setSearchInput] = useState('');

  const fetchTasks = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params: Record<string, string> = {};
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      const res = await taskService.list(params);
      setTasks(res.data.tasks);
      setStats(res.data.stats);
    } catch {
      toast.error('Erro ao carregar tarefas.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  // Busca com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  function setFilter(key: 'priority' | 'category' | 'status', val: string): void {
    setFilters((f) => ({ ...f, [key]: f[key] === val ? '' : val }) as TaskFilters);
  }

  async function handleStatusChange(id: string, status: Status): Promise<void> {
    try {
      await taskService.updateStatus(id, status);
      if (status === 'concluida') toast.success('Tarefa concluída! ✓');
      else toast.info('Status atualizado.');
      void fetchTasks(true);
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  }

  async function handleDelete(id: string): Promise<void> {
    try {
      await taskService.delete(id);
      toast.success('Tarefa removida.');
      void fetchTasks(true);
    } catch {
      toast.error('Erro ao deletar tarefa.');
    }
  }

  async function handleDeleteConcluidas(): Promise<void> {
    if (!window.confirm('Remover todas as tarefas concluídas?')) return;
    try {
      const res = await taskService.deleteConcluidas();
      toast.success(res.data.message);
      void fetchTasks();
    } catch {
      toast.error('Erro ao limpar tarefas.');
    }
  }

  function openEdit(task: Task): void {
    setEditingTask(task);
    setModalOpen(true);
  }

  function openCreate(): void {
    setEditingTask(null);
    setModalOpen(true);
  }

  async function handleSaveTask(data: TaskPayload): Promise<void> {
    try {
      if (editingTask) {
        await taskService.update(editingTask.id, data);
        toast.success('Tarefa atualizada!');
      } else {
        await taskService.create(data);
        toast.success('Tarefa criada!');
      }
      setModalOpen(false);
      void fetchTasks();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erro ao salvar tarefa.'));
    }
  }

  const activeFiltersCount = [filters.priority, filters.category, filters.status].filter(
    Boolean,
  ).length;

  return (
    <div className={styles.layout}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
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
          <span>TaskFlow</span>
        </div>

        <div className={styles.userInfo}>
          <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <p className={styles.userName}>{user?.name}</p>
            <p className={styles.userEmail}>{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{stats.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.statCard} style={{ background: 'var(--teal-lt)' }}>
            <span className={styles.statNum} style={{ color: 'var(--teal)' }}>
              {stats.concluidas}
            </span>
            <span className={styles.statLabel}>Concluídas</span>
          </div>
          <div className={styles.statCard} style={{ background: 'var(--amber-lt)' }}>
            <span className={styles.statNum} style={{ color: 'var(--amber)' }}>
              {stats.em_andamento}
            </span>
            <span className={styles.statLabel}>Em andamento</span>
          </div>
          <div className={styles.statCard} style={{ background: 'var(--pink-lt)' }}>
            <span className={styles.statNum} style={{ color: 'var(--pink)' }}>
              {stats.urgentes}
            </span>
            <span className={styles.statLabel}>Urgentes</span>
          </div>
        </div>

        {/* Progresso */}
        {stats.total > 0 && (
          <div className={styles.progress}>
            <div className={styles.progressHeader}>
              <span>Progresso do dia</span>
              <span>{Math.round((stats.concluidas / stats.total) * 100)}%</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(stats.concluidas / stats.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Filtros de status */}
        <div className={styles.filterSection}>
          <p className={styles.filterTitle}>Status</p>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <button
              key={val}
              className={`${styles.filterBtn} ${filters.status === val ? styles.active : ''}`}
              onClick={() => setFilter('status', val)}
            >
              <span className={styles.filterDot} data-status={val} />
              {label}
              {filters.status === val && <span className={styles.filterX}>×</span>}
            </button>
          ))}
        </div>

        {/* Filtros de categoria */}
        <div className={styles.filterSection}>
          <p className={styles.filterTitle}>Categoria</p>
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <button
              key={val}
              className={`${styles.filterBtn} ${filters.category === val ? styles.active : ''}`}
              onClick={() => setFilter('category', val)}
            >
              {label}
              {filters.category === val && <span className={styles.filterX}>×</span>}
            </button>
          ))}
        </div>

        {/* Filtros de prioridade */}
        <div className={styles.filterSection}>
          <p className={styles.filterTitle}>Prioridade</p>
          {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
            <button
              key={val}
              className={`${styles.filterBtn} ${filters.priority === val ? styles.active : ''}`}
              onClick={() => setFilter('priority', val)}
            >
              <span className={styles.priorityDot} data-priority={val} />
              {label}
              {filters.priority === val && <span className={styles.filterX}>×</span>}
            </button>
          ))}
        </div>

        {stats.concluidas > 0 && (
          <button className={styles.clearBtn} onClick={handleDeleteConcluidas}>
            Limpar concluídas ({stats.concluidas})
          </button>
        )}

        <div style={{ marginTop: 8 }}>
          <ThemeToggle />
        </div>

        <button className={styles.logoutBtn} onClick={logout}>
          Sair da conta
        </button>
      </aside>

      {/* MAIN */}
      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.pageTitle}>Minhas Tarefas</h1>
            <p className={styles.pageSubtitle}>
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
          <button className={styles.newBtn} onClick={openCreate}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nova tarefa
          </button>
        </div>

        {/* Barra de busca */}
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar tarefas..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setFilters((f) => ({ ...f, search: '' }));
                }}
              >
                ×
              </button>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button className={styles.clearFilters} onClick={() => setFilters(EMPTY_FILTERS)}>
              Limpar filtros ({activeFiltersCount})
            </button>
          )}
        </div>

        {/* Lista de tarefas */}
        {loading ? (
          <div className={styles.loadingState}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
            <p>Carregando tarefas...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className={styles.emptyState}>
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--gray-400)"
              strokeWidth="1.5"
            >
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
            <p>
              {activeFiltersCount || searchInput
                ? 'Nenhuma tarefa encontrada para os filtros selecionados.'
                : 'Nenhuma tarefa ainda. Crie a primeira!'}
            </p>
            {!activeFiltersCount && !searchInput && (
              <button className={styles.newBtn} onClick={openCreate}>
                Criar primeira tarefa
              </button>
            )}
          </div>
        ) : (
          <div className={styles.taskList}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* MODAL */}
      {modalOpen && (
        <TaskModal task={editingTask} onSave={handleSaveTask} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
