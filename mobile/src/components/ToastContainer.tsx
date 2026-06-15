import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { Colors } from '../theme';
import type { Toast, ToastType } from '../types';

function buildTypeStyles(c: Colors): Record<ToastType, { bg: string; color: string }> {
  return {
    success: { bg: c.tealLt, color: c.teal },
    error: { bg: c.redLt, color: c.red },
    info: { bg: c.purpleLt, color: c.purple },
  };
}

export default function ToastContainer({ toasts }: { toasts: Toast[] }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(), []);
  const typeStyle = useMemo(() => buildTypeStyles(colors), [colors]);

  if (!toasts.length) return null;

  return (
    <View style={styles.container}>
      {toasts.map((t) => {
        const s = typeStyle[t.type] ?? typeStyle.info;
        return (
          <View key={t.id} style={[styles.toast, { backgroundColor: s.bg }]}>
            <Text style={[styles.text, { color: s.color }]}>{t.message}</Text>
          </View>
        );
      })}
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      top: 60,
      left: 16,
      right: 16,
      zIndex: 9999,
      gap: 8,
    },
    toast: {
      padding: 12,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    text: { fontSize: 14, fontWeight: '500' },
  });
}
