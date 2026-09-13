import React from 'react';
import { useApp } from '../../context/AppContext';

const ICONS: Record<string, string> = {
  success: 'check_circle',
  warning: 'warning',
  error: 'cancel',
  info: 'info',
};

const COLORS: Record<string, string> = {
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--error)',
  info: 'var(--blue)',
};

export const ToastNotification: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="toast-enter flex items-center gap-3 px-4 py-3 rounded-lg shadow-elevated pointer-events-auto"
          style={{
            background: 'var(--bg-card)',
            border: `1px solid var(--border)`,
            borderLeft: `3px solid ${COLORS[toast.type]}`,
            minWidth: '280px',
            maxWidth: '380px',
          }}
        >
          <span
            className="material-symbols-outlined icon-fill text-[18px] shrink-0"
            style={{ color: COLORS[toast.type] }}
          >
            {ICONS[toast.type]}
          </span>
          <span className="text-xs flex-1" style={{ color: 'var(--text-primary)' }}>
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-0.5 rounded hover:opacity-80 transition-opacity shrink-0"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="material-symbols-outlined text-[15px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
