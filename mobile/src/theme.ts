import type { Category, Priority, Status } from './types';

export interface Colors {
  purple: string;
  purpleLt: string;
  purpleMd: string;
  teal: string;
  tealLt: string;
  amber: string;
  amberLt: string;
  pink: string;
  pinkLt: string;
  red: string;
  redLt: string;
  gray50: string;
  gray100: string;
  gray200: string;
  gray400: string;
  gray600: string;
  gray800: string;
  white: string;
  text: string;
  textSec: string;
  yellow: string;
}

export const lightColors: Colors = {
  purple: '#5C3BCC',
  purpleLt: '#EEEDFE',
  purpleMd: '#7F5FE0',
  teal: '#0F6E56',
  tealLt: '#E1F5EE',
  amber: '#854F0B',
  amberLt: '#FAEEDA',
  pink: '#993556',
  pinkLt: '#FBEAF0',
  red: '#C0392B',
  redLt: '#FDECEA',
  gray50: '#F8F7F4',
  gray100: '#F0EFE9',
  gray200: '#DEDCD6',
  gray400: '#9E9D98',
  gray600: '#5F5E5A',
  gray800: '#2C2C2A',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textSec: '#5F5E5A',
  yellow: '#FAC775',
};

export const darkColors: Colors = {
  purple: '#A892FF',
  purpleLt: '#2B2548',
  purpleMd: '#B7A4FF',
  teal: '#5DD9B5',
  tealLt: '#15302A',
  amber: '#F5B742',
  amberLt: '#3A2A14',
  pink: '#F08FB4',
  pinkLt: '#3A1F2A',
  red: '#FF8B7A',
  redLt: '#3A1A1A',
  gray50: '#0F0E13',
  gray100: '#1F1D26',
  gray200: '#3A3845',
  gray400: '#8B8896',
  gray600: '#B8B5C2',
  gray800: '#E5E3EC',
  white: '#1A1820',
  text: '#F0EEF6',
  textSec: '#B8B5C2',
  yellow: '#FAC775',
};

interface PriorityStyle {
  label: string;
  color: string;
  bg: string;
  bar: string;
}

interface CategoryStyle {
  label: string;
  icon: string;
}

interface StatusStyle {
  label: string;
  color: string;
  bg: string;
}

export function priorityFor(c: Colors): Record<Priority, PriorityStyle> {
  return {
    alta: { label: 'Alta', color: c.pink, bg: c.pinkLt, bar: '#E85C8A' },
    media: { label: 'Média', color: c.amber, bg: c.amberLt, bar: '#EF9F27' },
    baixa: { label: 'Baixa', color: c.teal, bg: c.tealLt, bar: c.teal },
  };
}

export const CATEGORY: Record<Category, CategoryStyle> = {
  faculdade: { label: 'Faculdade', icon: '📚' },
  trabalho: { label: 'Trabalho', icon: '💼' },
  pessoal: { label: 'Pessoal', icon: '👤' },
};

export function statusFor(c: Colors): Record<Status, StatusStyle> {
  return {
    pendente: { label: 'Pendente', color: c.gray600, bg: c.gray100 },
    em_andamento: { label: 'Em andamento', color: c.amber, bg: c.amberLt },
    concluida: { label: 'Concluída', color: c.teal, bg: c.tealLt },
  };
}
