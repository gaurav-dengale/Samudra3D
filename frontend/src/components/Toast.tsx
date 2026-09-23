import React from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { Toast, ToastType } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
  error:   <XCircle     className="w-4 h-4 text-red-400 shrink-0" />,
  info:    <Info        className="w-4 h-4 text-sky-400 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
};

const borders: Record<ToastType, string> = {
  success: 'border-emerald-500/40',
  error:   'border-red-500/40',
  info:    'border-sky-500/40',
  warning: 'border-amber-500/40',
};

const glows: Record<ToastType, string> = {
  success: 'shadow-emerald-500/10',
  error:   'shadow-red-500/10',
  info:    'shadow-sky-500/10',
  warning: 'shadow-amber-500/10',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto animate-toast-in flex items-start gap-3
            glass-bright rounded-xl px-4 py-3 shadow-xl min-w-[280px] max-w-[340px]
            border ${borders[toast.type]} ${glows[toast.type]}
          `}
        >
          <div className="mt-0.5">{icons[toast.type]}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white leading-tight">{toast.title}</div>
            {toast.message && (
              <div className="text-xs text-slate-400 mt-0.5 leading-snug">{toast.message}</div>
            )}
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-slate-500 hover:text-slate-300 transition shrink-0 mt-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
