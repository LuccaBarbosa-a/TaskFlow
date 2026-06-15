import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import type { ThemePreference } from '../../src/context/ThemeContext';
import type { Colors } from '../../src/theme';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: '⚙️ Sistema' },
  { value: 'light', label: '☀️ Claro' },
  { value: 'dark', label: '🌙 Escuro' },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, preference, setPreference } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  function handleLogout(): void {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  const initials = user?.name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.pageTitle}>Perfil</Text>

      {/* Avatar */}
      <View style={styles.avatarArea}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Aparencia */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Aparência</Text>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((opt) => {
            const active = preference === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.themeBtn, active && styles.themeBtnActive]}
                onPress={() => setPreference(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.themeBtnText, active && styles.themeBtnTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Informacoes */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informações da conta</Text>
        {[
          { label: 'Nome', value: user?.name },
          { label: 'Email', value: user?.email },
        ].map((item) => (
          <View key={item.label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Sobre */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sobre o app</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Versão</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tecnologia</Text>
          <Text style={styles.infoValue}>React Native + Expo</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Backend</Text>
          <Text style={styles.infoValue}>Node.js + Express</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function createStyles(c: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.gray50, padding: 16 },
    pageTitle: { fontSize: 22, fontWeight: '700', color: c.text, marginBottom: 20 },

    avatarArea: { alignItems: 'center', marginBottom: 24 },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: c.purple,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      shadowColor: c.purple,
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 5,
    },
    avatarText: { fontSize: 28, fontWeight: '700', color: c.white },
    name: { fontSize: 20, fontWeight: '700', color: c.text },
    email: { fontSize: 13, color: c.textSec, marginTop: 2 },

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
    cardTitle: { fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 12 },

    themeRow: { flexDirection: 'row', gap: 8 },
    themeBtn: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: c.gray200,
      backgroundColor: c.white,
      alignItems: 'center',
    },
    themeBtnActive: { borderColor: c.purple, backgroundColor: c.purpleLt },
    themeBtnText: { fontSize: 12, color: c.textSec },
    themeBtnTextActive: { color: c.purple, fontWeight: '600' },

    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderColor: c.gray100,
    },
    infoLabel: { fontSize: 13, color: c.textSec },
    infoValue: {
      fontSize: 13,
      color: c.text,
      fontWeight: '500',
      maxWidth: '60%',
      textAlign: 'right',
    },

    logoutBtn: {
      backgroundColor: c.redLt,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
    },
    logoutText: { color: c.red, fontSize: 15, fontWeight: '600' },
  });
}
