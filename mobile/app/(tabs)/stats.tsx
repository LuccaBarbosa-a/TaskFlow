import { useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { taskService } from '../../src/services/api';
import { useTheme } from '../../src/context/ThemeContext';
import type { Colors } from '../../src/theme';
import type { Task, TaskStats } from '../../src/types';

export default function StatsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [stats, setStats] = useState<TaskStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const res = await taskService.list();
      setStats(res.data.stats);
      setTasks(res.data.tasks ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      void load(isFirstFocus.current);
      isFirstFocus.current = false;
    }, [load]),
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.gray50,
        }}
      >
        <ActivityIndicator size="large" color={colors.purple} />
      </View>
    );
  }

  const total = stats?.total ?? 0;
  const pct = total > 0 ? Math.round(((stats?.concluidas ?? 0) / total) * 100) : 0;

  const byCategory = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});

  const byPriority = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {});

  const countCards = [
    { label: 'Total', value: stats?.total, color: colors.purple, bg: colors.purpleLt },
    { label: 'Pendentes', value: stats?.pendentes, color: colors.amber, bg: colors.amberLt },
    { label: 'Em andamento', value: stats?.em_andamento, color: colors.amber, bg: colors.amberLt },
    { label: 'Concluídas', value: stats?.concluidas, color: colors.teal, bg: colors.tealLt },
    { label: 'Urgentes', value: stats?.urgentes, color: colors.pink, bg: colors.pinkLt },
  ];

  const categoryRows = [
    { key: 'faculdade', icon: '📚', label: 'Faculdade' },
    { key: 'trabalho', icon: '💼', label: 'Trabalho' },
    { key: 'pessoal', icon: '👤', label: 'Pessoal' },
  ];

  const priorityRows = [
    { key: 'alta', label: 'Alta', color: colors.pink },
    { key: 'media', label: 'Média', color: colors.amber },
    { key: 'baixa', label: 'Baixa', color: colors.teal },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Estatísticas</Text>
        <Text style={styles.pageSub}>Visão geral das suas tarefas</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Progresso Geral</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressPct}>{pct}%</Text>
            <Text style={styles.progressLabel}>concluído</Text>
          </View>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.progressDetail}>
            {stats?.concluidas ?? 0} de {total} tarefas concluídas
          </Text>
        </View>

        <View style={styles.grid}>
          {countCards.map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
              <Text style={[styles.statNum, { color: s.color }]}>{s.value ?? 0}</Text>
              <Text style={[styles.statLabel, { color: s.color }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Por Categoria</Text>
          {categoryRows.map((c) => {
            const count = byCategory[c.key] || 0;
            const pctCat = total ? Math.round((count / total) * 100) : 0;
            return (
              <View key={c.key} style={styles.barRow}>
                <Text style={styles.barLabel}>
                  {c.icon} {c.label}
                </Text>
                <View style={styles.barWrap}>
                  <View
                    style={[styles.barCat, { width: `${pctCat}%`, backgroundColor: colors.purple }]}
                  />
                </View>
                <Text style={styles.barCount}>{count}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Por Prioridade</Text>
          {priorityRows.map((p) => {
            const count = byPriority[p.key] || 0;
            const pctP = total ? Math.round((count / total) * 100) : 0;
            return (
              <View key={p.key} style={styles.barRow}>
                <Text style={styles.barLabel}>{p.label}</Text>
                <View style={styles.barWrap}>
                  <View style={[styles.barCat, { width: `${pctP}%`, backgroundColor: p.color }]} />
                </View>
                <Text style={styles.barCount}>{count}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(c: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.gray50 },
    scroll: { padding: 16, paddingBottom: 32 },

    pageTitle: { fontSize: 22, fontWeight: '700', color: c.text },
    pageSub: { fontSize: 13, color: c.textSec, marginBottom: 16, marginTop: 2 },

    card: {
      backgroundColor: c.white,
      borderRadius: 14,
      padding: 16,
      marginBottom: 14,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    cardTitle: { fontSize: 15, fontWeight: '600', color: c.text, marginBottom: 12 },

    progressRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 8 },
    progressPct: { fontSize: 36, fontWeight: '700', color: c.purple },
    progressLabel: { fontSize: 14, color: c.textSec },
    barBg: {
      height: 10,
      backgroundColor: c.gray100,
      borderRadius: 5,
      overflow: 'hidden',
      marginBottom: 8,
    },
    barFill: { height: '100%', backgroundColor: c.purple, borderRadius: 5 },
    progressDetail: { fontSize: 12, color: c.textSec },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
    statCard: {
      flex: 1,
      minWidth: '28%',
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
    },
    statNum: { fontSize: 24, fontWeight: '700' },
    statLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },

    barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    barLabel: { fontSize: 13, color: c.text, width: 90 },
    barWrap: {
      flex: 1,
      height: 8,
      backgroundColor: c.gray100,
      borderRadius: 4,
      overflow: 'hidden',
    },
    barCat: { height: '100%', borderRadius: 4, minWidth: 2 },
    barCount: { fontSize: 12, color: c.textSec, width: 24, textAlign: 'right' },
  });
}
