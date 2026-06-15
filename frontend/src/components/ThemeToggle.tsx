import { useTheme } from '../context/ThemeContext';
import type { ThemePreference } from '../context/ThemeContext';
import styles from './ThemeToggle.module.css';

const LABELS: Record<ThemePreference, string> = {
  system: 'Sistema',
  light: 'Claro',
  dark: 'Escuro',
};

const HINTS: Record<ThemePreference, string> = {
  system: 'Seguindo o sistema (clique para Claro)',
  light: 'Tema claro (clique para Escuro)',
  dark: 'Tema escuro (clique para seguir o Sistema)',
};

/** Botao que cicla entre Sistema -> Claro -> Escuro. */
export default function ThemeToggle() {
  const { preference, cycle } = useTheme();

  return (
    <button
      type="button"
      className={styles.btn}
      onClick={cycle}
      title={HINTS[preference]}
      aria-label={`Tema atual: ${LABELS[preference]}`}
    >
      <span className={styles.icon}>{renderIcon(preference)}</span>
      <span className={styles.label}>Tema: {LABELS[preference]}</span>
    </button>
  );
}

function renderIcon(pref: ThemePreference) {
  if (pref === 'light') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }
  if (pref === 'dark') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  // system
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
