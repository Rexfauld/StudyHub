import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
};

const COLORS = {
  success: { bg: '#f0fdf4', border: '#86efac', icon: '#16a34a', text: '#14532d' },
  error:   { bg: '#fef2f2', border: '#fca5a5', icon: '#dc2626', text: '#7f1d1d' },
  info:    { bg: '#eff6ff', border: '#93c5fd', icon: '#2563eb', text: '#1e3a8a' },
  warning: { bg: '#fffbeb', border: '#fcd34d', icon: '#d97706', text: '#78350f' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320);
  }, []);

  const toast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    if (duration > 0) {
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  // Convenience methods
  toast.success = (msg, dur) => toast(msg, 'success', dur);
  toast.error   = (msg, dur) => toast(msg, 'error', dur);
  toast.info    = (msg, dur) => toast(msg, 'info', dur);
  toast.warning = (msg, dur) => toast(msg, 'warning', dur);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column-reverse', gap: 10,
        pointerEvents: 'none', maxWidth: 360, width: 'calc(100vw - 48px)'
      }}>
        <style>{`
          @keyframes toastIn  { from { opacity:0; transform:translateY(16px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
          @keyframes toastOut { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateY(10px) scale(0.95); } }
        `}</style>
        {toasts.map(t => {
          const c = COLORS[t.type] || COLORS.info;
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              background: c.bg, border: `1.5px solid ${c.border}`,
              borderRadius: 14, padding: '13px 14px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              animation: t.exiting ? 'toastOut 0.3s ease forwards' : 'toastIn 0.3s ease both',
              pointerEvents: 'all', cursor: 'default'
            }}>
              <span style={{ color: c.icon, flexShrink: 0, marginTop: 1 }}>{ICONS[t.type]}</span>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: c.text, lineHeight: 1.5, flex: 1 }}>{t.message}</p>
              <button onClick={() => dismiss(t.id)} style={{
                background: 'none', border: 'none', color: c.icon, cursor: 'pointer',
                padding: '0 0 0 4px', fontSize: 16, opacity: 0.6, flexShrink: 0, lineHeight: 1
              }}>✕</button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
