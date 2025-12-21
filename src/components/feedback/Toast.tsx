/**
 * Toast - Error toast notification component using Radix UI
 */

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, AlertCircle } from "lucide-react";
import * as styles from "./toast.css";

interface ToastContextValue {
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Hook to access toast functions
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Toast provider that wraps the app and provides toast functionality
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const showError = useCallback((msg: string) => {
    setMessage(msg);
    setOpen(true);
  }, []);

  return (
    <ToastContext.Provider value={{ showError }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
        {children}

        <ToastPrimitive.Root
          className={`${styles.toastRoot} ${styles.toastError}`}
          open={open}
          onOpenChange={setOpen}
        >
          <div className={styles.toastIconWrapper}>
            <AlertCircle size={18} />
          </div>
          <div className={styles.toastContent}>
            <ToastPrimitive.Title className={styles.toastTitle}>Error</ToastPrimitive.Title>
            <ToastPrimitive.Description className={styles.toastDescription}>
              {message}
            </ToastPrimitive.Description>
          </div>
          <ToastPrimitive.Close className={styles.toastClose} aria-label="Dismiss">
            <X size={14} />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>

        <ToastPrimitive.Viewport className={styles.toastViewport} />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
