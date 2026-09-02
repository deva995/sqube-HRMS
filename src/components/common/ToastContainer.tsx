import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Sparkles
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { ToastItem, ToastType } from '../../types';

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { id, title, message, type = 'success', action, duration = 4000 } = toast;

  const typeConfig: Record<
    ToastType,
    {
      icon: React.ComponentType<{ className?: string }>;
      iconColor: string;
      iconBg: string;
      borderColor: string;
      accentBar: string;
      progressBg: string;
    }
  > = {
    success: {
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      borderColor: 'border-emerald-200/80',
      accentBar: 'bg-emerald-500',
      progressBg: 'bg-emerald-500/30',
    },
    info: {
      icon: Info,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      borderColor: 'border-indigo-200/80',
      accentBar: 'bg-indigo-500',
      progressBg: 'bg-indigo-500/30',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      borderColor: 'border-amber-200/80',
      accentBar: 'bg-amber-500',
      progressBg: 'bg-amber-500/30',
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50',
      borderColor: 'border-rose-200/80',
      accentBar: 'bg-rose-500',
      progressBg: 'bg-rose-500/30',
    },
  };

  const config = typeConfig[type] || typeConfig.success;
  const IconComponent = config.icon;

  return (
    <div
      id={`toast-${id}`}
      role="status"
      aria-live="polite"
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border ${config.borderColor} shadow-lg shadow-slate-900/5 transition-all duration-300 transform translate-y-0 opacity-100 hover:shadow-xl group min-w-[300px] max-w-sm`}
    >
      {/* Accent Indicator Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.accentBar}`} />

      {/* Icon */}
      <div className={`shrink-0 w-8 h-8 rounded-lg ${config.iconBg} ${config.iconColor} flex items-center justify-center`}>
        <IconComponent className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        {title && (
          <h5 className="text-xs font-bold text-slate-900 font-heading tracking-tight leading-snug">
            {title}
          </h5>
        )}
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed break-words">
          {message}
        </p>

        {action && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => {
                action.onClick();
                onDismiss(id);
              }}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
            >
              {action.label}
            </button>
          </div>
        )}
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="shrink-0 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Auto-Dismiss Progress Line (if duration > 0) */}
      {duration > 0 && (
        <div
          className={`absolute bottom-0 left-1 right-0 h-0.5 ${config.progressBg}`}
        >
          <div
            className={`h-full ${config.accentBar} transition-all ease-linear`}
            style={{
              animation: `toastProgress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useHrms();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      id="global-toast-container"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};
