'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer, ToastData } from '@/components/ui/toast';
import { v4 as uuidv4 } from 'uuid';

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = uuidv4();
    const newToast: ToastData = {
      id,
      duration: 5000, // Default 5 seconds
      ...toast,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showToast({
      type: 'success',
      message,
      title,
      duration: 4000,
    });
  }, [showToast]);

  const showError = useCallback((message: string, title?: string) => {
    showToast({
      type: 'error',
      message,
      title,
      duration: 6000, // Errors stay longer
    });
  }, [showToast]);

  const showWarning = useCallback((message: string, title?: string) => {
    showToast({
      type: 'warning',
      message,
      title,
      duration: 5000,
    });
  }, [showToast]);

  const showInfo = useCallback((message: string, title?: string) => {
    showToast({
      type: 'info',
      message,
      title,
      duration: 4000,
    });
  }, [showToast]);

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
    hideAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}