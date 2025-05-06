"use client";
import { useState, useEffect, createContext, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
export type ToastVariant = "default" | "success" | "destructive" | "info";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (props: Omit<Toast, "id">) => {
    const id = uuidv4();
    const newToast = {
      id,
      variant: "default" as ToastVariant,
      duration: 5000,
      ...props,
    };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    // Auto dismiss after duration
    if (newToast.duration !== Infinity) {
      setTimeout(() => {
        dismiss(id);
      }, newToast.duration);
    }
  };

  const dismiss = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const dismissAll = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  return context;
}

function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 max-w-md w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);

  const variantStyles = {
    default: "bg-white border-gray-200",
    success: "bg-green-50 border-green-200",
    destructive: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  const iconColors = {
    default: "text-gray-600",
    success: "text-green-500",
    destructive: "text-red-500",
    info: "text-blue-500",
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
        ${variantStyles[toast.variant || "default"]}
        border rounded-lg shadow-md p-4 flex items-start
      `}
      role="alert"
    >
      {toast.icon && (
        <div className={`mr-3 ${iconColors[toast.variant || "default"]}`}>
          {toast.icon}
        </div>
      )}
      
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{toast.title}</h3>
        {toast.description && (
          <p className="mt-1 text-sm text-gray-600">{toast.description}</p>
        )}
        {toast.action && (
          <div className="mt-2">{toast.action}</div>
        )}
      </div>
      
      <button
        onClick={onDismiss}
        className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close notification"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
