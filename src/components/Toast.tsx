import React from 'react';

export interface ToastData {
  id: string;
  title: string;
  subtitle?: string;
  type?: 'success' | 'info';
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 flex items-center gap-space-sm bg-surface-container-lowest text-on-surface px-space-lg py-space-md rounded-xl shadow-xl border border-surface-container max-w-sm transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
        <span className="material-symbols-outlined text-[18px]">check_circle</span>
      </div>
      <div className="flex flex-col min-w-0 pr-2">
        <span className="font-headline-sm text-sm text-primary font-bold truncate">
          {toast.title}
        </span>
        {toast.subtitle && (
          <span className="font-body-sm text-xs text-on-surface-variant truncate">
            {toast.subtitle}
          </span>
        )}
      </div>
      <button
        onClick={onClose}
        className="w-6 h-6 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0"
        aria-label="Kapat"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
};
