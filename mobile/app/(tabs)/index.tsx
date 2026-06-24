import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { getApiErrorMessage, taskService } from '../../src/services/api';
import TaskCard from '../../src/components/TaskCard';
import TaskModal from '../../src/components/TaskModal';
import ToastContainer from '../../src/components/ToastContainer';
import { useToast } from '../../src/hooks/useToast';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import type { Colors } from '../../src/theme';
import type { Status, Task, TaskPayload, TaskStats } from '../../src/types';

const FILTERS: Record<'status' | 'priority' | 'category', string[]> = {
  status: ['pendente', 'em_andamento', 'concluida'],
  priority: ['alta', 'media', 'baixa'],
  category: ['faculdade', 'trabalho', 'pessoal'],
};

const FILTER_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  alta: '🔴 Alta',
  media: '🟡 Média',
  baixa: '🟢 Baixa',
  faculdade: '📚 Faculdade',
  trabalho: '💼 Trabalho',
  pessoal: '👤 Pessoal',
};

const EMPTY_STATS: TaskStats = {
  total: 0,
  concluidas: 0,
  pendentes: 0,
  em_andamento: 0,
  urgentes: 0,
};

interface ActiveFilter {
  type: string;
  value: string;
}

export default function TasksScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { user } = useAuth();
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>({ type: '', value: '' });

  const fetchTasks = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setLoading(true);
        const params: Record<string, string> = {};
        if (activeFilter.type === 'status') params.status = activeFilter.value;
        if (activeFilter.type === 'priority') params.priority = activeFilter.value;
        if (activeFilter.type === 'category') params.category = activeFilter.value;
        if (search) params.search = search;

        const res = await taskService.list(params);
        setTasks(res.data.tasks ?? []);
        setStats(res.data.stats ?? EMPTY_STATS);
      } catch {
        toastRef.current.error('Erro ao carregar tarefas. Verifique se o servidor está rodando.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeFilter, search],
  );

  useEffect(() => {
    const timer = setTimeout(() => void fetchTasks(), search ? 400 : 0);
    return () => clearTimeout(timer);
    // fetchTasks já fecha sobre `search` via useCallback — não duplicar aqui
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTasks]);

  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      void fetchTasks(false);
    }, [fetchTasks]),
  );

  function toggleFilter(type: string, value: string): void {
    setActiveFilter((prev) =>
      prev.type === type && prev.value === value ? { type: '', value: '' } : { type, value },
    );
  }

  async function handleStatusChange(id: string, status: Status): Promise<void> {
    try {
      await taskService.updateStatus(id, status);
      if (status === 'concluida') toastRef.current.success('Tarefa concluída! ✓');
      void fetchTasks(false);
    } catch {
      toastRef.current.error('Erro ao atualizar status.');
    }
  }

  async function handleDelete(id: string): Promise<void> {
    try {
      await taskService.delete(id);
      toastRef.current.success('Tarefa removida.');
      void fetchTasks(false);
    } catch {
      toastRef.current.error('Erro ao deletar tarefa.');
    }
  }

  async function handleSave(data: TaskPayload): Promise<void> {
    try {
      if (editingTask) {
        await taskService.update(editingTask.id, data);
        toastRef.current.success('Tarefa atualizada!');
      } else {
        await taskService.create(data);
        toastRef.current.success('Tarefa criada!');
      }
      setModalVisible(false);
      void fetchTasks(false);
    } catch (err) {
      toastRef.current.error(getApiErrorMessage(err, 'Erro ao salvar tarefa.'));
    }
  }

  function openCreate(): void {
    setEditingTask(null);
    setModalVisible(true);
  }

  function openEdit(t: Task): void {
    setEditingTask(t);
    setModalVisible(true);
  }

  const hasFilter = !!activeFilter.value || !!search;

  const statChips = [
    { label: 'Total', value: stats.total, color: colors.purple, bg: colors.purpleLt },
    { label: 'Concluídas', value: stats.concluidas, color: colors.teal, bg: colors.tealLt },
    { label: 'Pendentes', value: stats.pendentes, color: colors.amber, bg: colors.amberLt },
    { label: 'Urgentes', value: stats.urgentes, color: colors.pink, bg: colors.pinkLt },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ToastContainer toasts={toast.toasts} />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {stats.total > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsRow}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
        >
          {statChips.map((s) => (
            <View key={s.label} style={[styles.statChip, { backgroundColor: s.bg }]}>
              <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: s.color }]}>{s.label}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={{ color: colors.gray400, fontSize: 15 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar tarefas..."
            placeholderTextColor={colors.gray400}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: colors.gray400, fontSize: 18 }}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}
      >
        {hasFilter && (
          <TouchableOpacity
            style={[styles.filterChip, styles.filterChipClear]}
            onPress={() => {
              setActiveFilter({ type: '', value: '' });
              setSearch('');
            }}
          >
            <Text style={styles.filterChipClearText}>✕ Limpar</Text>
          </TouchableOpacity>
        )}
        {Object.entries(FILTERS).flatMap(([type, values]) =>
          values.map((value) => {
            const active = activeFilter.type === type && activeFilter.value === value;
            return (
              <TouchableOpacity
                key={`${type}-${value}`}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => toggleFilter(type, value)}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {FILTER_LABELS[value]}
                </Text>
              </TouchableOpacity>
            );
          }),
        )}
      </ScrollView>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.purple} />
          <Text style={styles.loadingText}>Carregando tarefas...</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void fetchTasks(false);
              }}
              colors={[colors.purple]}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ fontSize: 48 }}>📋</Text>
              <Text style={styles.emptyTitle}>
                {hasFilter ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa ainda'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {hasFilter ? 'Tente outros filtros' : 'Toque em + para criar a primeira'}
              </Text>
              {!hasFilter && (
                <TouchableOpacity style={styles.emptyBtn} onPress={openCreate}>
                  <Text style={styles.emptyBtnText}>Criar primeira tarefa</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onStatusChange={handleStatusChange}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          )}
        />
      )}

      <TaskModal
        visible={modalVisible}
        task={editingTask}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

function createStyles(c: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.gray50 },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    greeting: { fontSize: 18, fontWeight: '700', color: c.text },
    date: { fontSize: 12, color: c.textSec, marginTop: 2 },
    addBtn: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: c.purple,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: c.purple,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    addBtnText: { fontSize: 24, color: c.white, lineHeight: 28 },

    statsRow: { marginBottom: 10 },
    statChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      alignItems: 'center',
      minWidth: 72,
    },
    statNum: { fontSize: 20, fontWeight: '700', lineHeight: 24 },
    statLabel: { fontSize: 10, fontWeight: '500', marginTop: 1 },

    searchRow: { paddingHorizontal: 16, marginBottom: 8 },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.white,
      borderWidth: 1.5,
      borderColor: c.gray200,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    searchInput: { flex: 1, fontSize: 14, color: c.text },

    filtersScroll: { marginBottom: 8 },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: c.gray200,
      backgroundColor: c.white,
    },
    filterChipActive: { borderColor: c.purple, backgroundColor: c.purpleLt },
    filterChipClear: { borderColor: c.red, backgroundColor: c.redLt },
    filterChipText: { fontSize: 12, color: c.textSec },
    filterChipTextActive: { color: c.purple, fontWeight: '600' },
    filterChipClearText: { fontSize: 12, color: c.red, fontWeight: '500' },

    list: { paddingHorizontal: 16, paddingBottom: 32 },

    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      gap: 8,
    },
    loadingText: { fontSize: 14, color: c.textSec, marginTop: 8 },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: c.text },
    emptySubtitle: { fontSize: 13, color: c.textSec },
    emptyBtn: {
      marginTop: 8,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: c.purple,
      borderRadius: 8,
    },
    emptyBtnText: { color: c.white, fontWeight: '600', fontSize: 14 },
  });
}
