import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CATEGORY, priorityFor, statusFor } from '../theme';
import type { Colors } from '../theme';
import type { Status, Task } from '../types';

const STATUS_NEXT: Record<Status, Status> = {
  pendente: 'em_andamento',
  em_andamento: 'concluida',
  concluida: 'pendente',
};

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: Status) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

function formatDate(str: string | null): string | null {
  if (!str) return null;
  return new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const PRIORITY = useMemo(() => priorityFor(colors), [colors]);
  const STATUS = useMemo(() => statusFor(colors), [colors]);

  const priority = PRIORITY[task.priority] ?? PRIORITY.media;
  const category = CATEGORY[task.category] ?? CATEGORY.pessoal;
  const status = STATUS[task.status] ?? STATUS.pendente;
  const isDone = task.status === 'concluida';

  const isOverdue = !!task.due_date && !isDone && new Date(task.due_date) < new Date();

  function confirmDelete(): void {
    Alert.alert('Deletar tarefa', `Tem certeza que deseja remover "${task.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Deletar', style: 'destructive', onPress: () => onDelete(task.id) },
    ]);
  }

  return (
    <View style={[styles.card, isDone && styles.cardDone]}>
      {/* Barra de prioridade */}
      <View style={[styles.priorityBar, { backgroundColor: priority.bar }]} />

      <View style={styles.body}>
        {/* Checkbox */}
        <TouchableOpacity
          style={[
            styles.check,
            isDone && styles.checkDone,
            task.status === 'em_andamento' && styles.checkProgress,
          ]}
          onPress={() => onStatusChange(task.id, STATUS_NEXT[task.status])}
          activeOpacity={0.7}
        >
          {isDone && <Text style={styles.checkIcon}>✓</Text>}
          {task.status === 'em_andamento' && <View style={styles.halfDot} />}
        </TouchableOpacity>

        {/* Conteudo */}
        <View style={styles.content}>
          <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={2}>
            {task.title}
          </Text>

          {task.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}

          <View style={styles.meta}>
            <View style={[styles.badge, { backgroundColor: priority.bg }]}>
              <Text style={[styles.badgeText, { color: priority.color }]}>{priority.label}</Text>
            </View>

            <Text style={styles.category}>
              {category.icon} {category.label}
            </Text>

            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>

            {task.due_date && (
              <Text style={[styles.date, isOverdue && styles.dateOverdue]}>
                📅 {formatDate(task.due_date)}
                {isOverdue ? ' ⚠️' : ''}
              </Text>
            )}
          </View>
        </View>

        {/* Acoes */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(task)}>
            <Text style={styles.iconBtnText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDanger]} onPress={confirmDelete}>
            <Text style={styles.iconBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function createStyles(c: Colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.white,
      borderRadius: 12,
      flexDirection: 'row',
      overflow: 'hidden',
      marginBottom: 10,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    cardDone: { opacity: 0.65 },

    priorityBar: { width: 4 },

    body: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 12,
      gap: 10,
    },

    check: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: c.gray200,
      backgroundColor: c.white,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
      flexShrink: 0,
    },
    checkDone: { backgroundColor: c.teal, borderColor: c.teal },
    checkProgress: { borderColor: '#EF9F27' },
    checkIcon: { color: c.white, fontSize: 12, fontWeight: '700' },
    halfDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF9F27' },

    content: { flex: 1 },

    title: {
      fontSize: 14,
      fontWeight: '500',
      color: c.text,
      marginBottom: 3,
      lineHeight: 20,
    },
    titleDone: {
      textDecorationLine: 'line-through',
      color: c.gray400,
    },

    description: {
      fontSize: 12,
      color: c.textSec,
      marginBottom: 6,
      lineHeight: 18,
    },

    meta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 4,
    },

    badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
    },
    badgeText: { fontSize: 11, fontWeight: '600' },

    category: { fontSize: 11, color: c.textSec },

    statusBadge: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 999,
    },
    statusText: { fontSize: 11 },

    date: { fontSize: 11, color: c.textSec },
    dateOverdue: { color: c.red, fontWeight: '500' },

    actions: { gap: 4 },
    iconBtn: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: c.gray50,
    },
    iconBtnDanger: { backgroundColor: c.redLt },
    iconBtnText: { fontSize: 14 },
  });
}
