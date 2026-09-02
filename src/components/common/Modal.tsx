import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  id,
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div
      id={id || 'modal-backdrop'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/90 w-full ${maxWidthClasses} overflow-hidden my-8 z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col`}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200/70 flex items-start justify-between bg-slate-50/70 backdrop-blur-xs">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-6 py-4 bg-slate-50/70 backdrop-blur-xs border-t border-slate-200/70 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
