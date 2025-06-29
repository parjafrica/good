import { useState, useCallback } from 'react';

interface ToastMessage {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface Toast extends ToastMessage {
  id: string;
}

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: ToastMessage) => {
    const id = (++toastIdCounter).toString();
    const newToast: Toast = {
      ...message,
      id,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);

    return {
      id,
      dismiss: () => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      },
    };
  }, []);

  return {
    toast,
    toasts,
    dismiss: (id: string) => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    },
  };
}