// src/components/ui/use-toast.tsx

import { useState, useEffect } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const toastState: ToastState = {
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastState.addToast = (toast) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };

    toastState.removeToast = (id) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    };
  }, []);

  return {
    toasts,
    toast: toastState.addToast,
    dismiss: toastState.removeToast,
  };
}