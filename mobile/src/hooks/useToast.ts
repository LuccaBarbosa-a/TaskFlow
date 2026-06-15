import { useState, useCallback } from 'react';
import type { Toast, ToastType } from '../types';

export interface ToastApi {
  toasts: Toast[];
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
}

export function useToast(): ToastApi {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return {
    toasts,
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error'),
    info: (msg) => show(msg, 'info'),
  };
}
