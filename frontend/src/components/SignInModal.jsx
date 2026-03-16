import { useState, useEffect } from 'react';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

export default function SignInModal({ open, onClose }) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('options'); // 'options' | 'email'
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setVisible(true); setMode('options'); setError(''); }
    else setTimeout(() => setVisible(false), 260);
  }, [open]);

  if (!visible) return null;

  const handleOAuth = (provider) => {
    setLoading(provider);
    window.location.href = `${BACKEND}/api/auth/${provider}`;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading('email');
    try {
      const res = await fetch(`${BACKEND}/api/auth/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign in failed');
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <style>{css}</style>
      <div
        style={{ ...s.modal, animation: open ? 'modalIn 0.26s cubic-bezier(.34,1.56,.64,1) both' : 'modalOut 0.22s ease both' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button style={s.closeBtn} onClick={onClose}>✕</button>

        {/* Logo & title */}
        <div style={s.modalTop}>
          <div style={s.logoMark}>S</div>
          <h2 style={s.modalTitle}>Welcome to StudyHub</h2>
          <p style={s.modalSub}>Sign in to upload & download resources</p>
        </div>

        {mode === 'options' && (
          <div style={s.optionsList}>
            {/* Google */}
            <button className="signin-btn" style={s.providerBtn} onClick={() => handleOAuth('google')} disabled={!!loading}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span>{loading === 'google' ? 'Redirecting…' : 'Continue with Google'}</span>
            </button>

            {/* Microsoft */}
            <button className="signin-btn" style={s.providerBtn} onClick={() => handleOAuth('microsoft')} disabled={!!loading}>
              <svg width="20" height="20" viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg>
              <span>{loading === 'microsoft' ? 'Redirecting…' : 'Continue with Microsoft'}</span>
            </button>

            {/* GitHub */}
            <button className="signin-btn" style={s.providerBtn} onClick={() => handleOAuth('github')} disabled={!!loading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              <span>{loading === 'github' ? 'Redirecting…' : 'Continue with GitHub'}</span>
            </button>

            <div style={s.divider}><span style={s.dividerText}>or</span></div>

            {/* Email */}
            <button className="signin-btn email-btn" style={{ ...s.providerBtn, ...s.emailBtn }} onClick={() => setMode('email')} disabled={!!loading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
              <span>Continue with Email</span>
            </button>
          </div>
        )}

        {mode === 'email' && (
          <form onSubmit={handleEmailSubmit} style={s.emailForm}>
            <button type="button" style={s.backLink} onClick={() => setMode('options')}>← Back</button>
            {error && <div style={s.errorBox}>{error}</div>}
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input
                type="email" required autoFocus
                value={email} onChange={e => setEmail(e.target.value)}
                style={s.input} placeholder="you@example.com"
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                type="password" required
                value={password} onChange={e => setPassword(e.target.value)}
                style={s.input} placeholder="••••••••"
              />
            </div>
            <button type="submit" style={s.submitBtn} disabled={loading === 'email'}>
              {loading === 'email' ? 'Signing in…' : 'Sign In'}
            </button>
            <p style={s.signupNote}>
              No account? <a href={`${BACKEND}/api/auth/register`} style={s.link}>Create one</a>
            </p>
          </form>
        )}

        <p style={s.terms}>By signing in you agree to our Terms & Privacy Policy</p>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(10,10,20,0.55)',
    backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: 'white', borderRadius: 24,
    width: '100%', maxWidth: 420,
    padding: '36px 32px 28px',
    boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 16,
    background: '#f3f3f5', border: 'none',
    borderRadius: 50, width: 32, height: 32,
    cursor: 'pointer', fontSize: 14, color: '#666',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modalTop: { textAlign: 'center', marginBottom: 28 },
  logoMark: {
    width: 52, height: 52, borderRadius: 14,
    background: 'linear-gradient(135deg,#1a1a2e,#16213e)',
    color: 'white', fontSize: 24, fontWeight: 900,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 14px', letterSpacing: -1,
    boxShadow: '0 8px 20px rgba(26,26,46,0.28)',
  },
  modalTitle: { margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#0f0f1a' },
  modalSub: { margin: 0, fontSize: 14, color: '#888' },
  optionsList: { display: 'flex', flexDirection: 'column', gap: 10 },
  providerBtn: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 18px', borderRadius: 12,
    border: '1.5px solid #e8e8ec', background: 'white',
    cursor: 'pointer', fontSize: 15, fontWeight: 500, color: '#1a1a2e',
    transition: 'all 0.18s', width: '100%', fontFamily: 'inherit',
  },
  emailBtn: { background: '#1a1a2e', color: 'white', border: 'none' },
  divider: { display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' },
  dividerText: { color: '#bbb', fontSize: 13, whiteSpace: 'nowrap' },
  emailForm: { display: 'flex', flexDirection: 'column', gap: 14 },
  backLink: { background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 14, textAlign: 'left', padding: 0, marginBottom: 4 },
  errorBox: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#444' },
  input: { padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e8e8ec', fontSize: 15, outline: 'none', fontFamily: 'inherit' },
  submitBtn: {
    padding: '13px', borderRadius: 12, border: 'none',
    background: 'linear-gradient(135deg,#1a1a2e,#0d6efd)',
    color: 'white', fontSize: 16, fontWeight: 600,
    cursor: 'pointer', marginTop: 4, fontFamily: 'inherit',
  },
  signupNote: { textAlign: 'center', fontSize: 13, color: '#888', margin: 0 },
  link: { color: '#0d6efd', textDecoration: 'none', fontWeight: 600 },
  terms: { textAlign: 'center', fontSize: 12, color: '#bbb', marginTop: 20, marginBottom: 0 },
};

const css = `
  @keyframes modalIn {
    from { opacity:0; transform: scale(0.88) translateY(20px); }
    to   { opacity:1; transform: scale(1) translateY(0); }
  }
  @keyframes modalOut {
    from { opacity:1; transform: scale(1); }
    to   { opacity:0; transform: scale(0.92); }
  }
  .signin-btn:hover:not(:disabled) {
    border-color: #1a1a2e !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(0,0,0,0.10);
  }
  .email-btn:hover:not(:disabled) {
    background: #0d1a3a !important;
    box-shadow: 0 6px 20px rgba(26,26,46,0.3) !important;
  }
`;
