import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useToast } from '../../src/hooks/useToast';
import { getApiErrorMessage } from '../../src/services/api';
import ToastContainer from '../../src/components/ToastContainer';
import type { Colors } from '../../src/theme';

export default function LoginScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();

  async function handleLogin(): Promise<void> {
    if (!email || !password) {
      toast.error('Preencha email e senha.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erro ao fazer login. Verifique o IP do servidor.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <ToastContainer toasts={toast.toasts} />

        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>✓</Text>
          </View>
          <Text style={styles.logoText}>TaskFlow</Text>
          <Text style={styles.logoSub}>Organize seu dia com eficiência</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Entrar na conta</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              placeholderTextColor={colors.gray400}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.gray400}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={styles.linkBtn}>
              <Text style={styles.linkText}>
                Não tem conta? <Text style={styles.linkHighlight}>Criar conta grátis</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(c: Colors) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: c.gray50,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    logoArea: { alignItems: 'center', marginBottom: 32 },
    logoBox: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: c.purple,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      shadowColor: c.purple,
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    logoIcon: { fontSize: 28, color: c.white, fontWeight: '700' },
    logoText: { fontSize: 26, fontWeight: '700', color: c.purple },
    logoSub: { fontSize: 13, color: c.textSec, marginTop: 4 },

    card: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: c.white,
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOpacity: 0.07,
      shadowRadius: 16,
      elevation: 3,
    },
    title: { fontSize: 20, fontWeight: '700', color: c.text, marginBottom: 20 },

    field: { marginBottom: 14 },
    label: { fontSize: 13, fontWeight: '500', color: c.gray600, marginBottom: 6 },
    input: {
      borderWidth: 1.5,
      borderColor: c.gray200,
      borderRadius: 8,
      padding: 11,
      fontSize: 14,
      color: c.text,
      backgroundColor: c.white,
    },

    btn: {
      backgroundColor: c.purple,
      borderRadius: 8,
      padding: 13,
      alignItems: 'center',
      marginTop: 6,
    },
    btnDisabled: { opacity: 0.65 },
    btnText: { color: c.white, fontSize: 15, fontWeight: '600' },

    linkBtn: { marginTop: 16, alignItems: 'center' },
    linkText: { fontSize: 14, color: c.textSec },
    linkHighlight: { color: c.purple, fontWeight: '500' },
  });
}
