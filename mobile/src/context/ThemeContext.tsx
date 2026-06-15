import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme';
import type { Colors } from '../theme';

export type ThemePreference = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

interface ThemeContextValue {
  preference: ThemePreference;
  effective: EffectiveTheme;
  colors: Colors;
  setPreference: (next: ThemePreference) => void;
  cycle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'taskflow_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark') setPreferenceState(v);
      })
      .catch((err) => console.warn('Falha ao ler preferencia de tema:', err));
  }, []);

  const effective: EffectiveTheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const colors = effective === 'dark' ? darkColors : lightColors;

  const persist = useCallback((next: ThemePreference) => {
    if (next === 'system') {
      void AsyncStorage.removeItem(STORAGE_KEY);
    } else {
      void AsyncStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      setPreferenceState(next);
      persist(next);
    },
    [persist],
  );

  const cycle = useCallback(() => {
    setPreferenceState((prev) => {
      const next: ThemePreference =
        prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system';
      persist(next);
      return next;
    });
  }, [persist]);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, effective, colors, setPreference, cycle }),
    [preference, effective, colors, setPreference, cycle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
}
