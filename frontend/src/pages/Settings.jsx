import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings, ACCENT_MAP, FONT_SIZE_MAP, FONT_FAMILY_MAP } from '../context/SettingsContext';
import API from '../api';

const FONT_SIZES    = [{ key:'small', label:'Small' }, { key:'medium', label:'Medium' }, { key:'large', label:'Large' }, { key:'xlarge', label:'X-Large' }];
const FONT_FAMILIES = [{ key:'system', label:'System' }, { key:'serif', label:'Serif' }, { key:'mono', label:'Mono' }];
const ACCENTS       = [{ key:'gold', color:'#e8b84b' }, { key:'blue', color:'#3b82f6' }, { key:'green', color:'#22c55e' }, { key:'rose', color:'#f43f5e' }];

export default function Settings() {
  const { user, logout } = useAuth();
  const { settings, update } = useSettings();

  const [name,        setName]        = useState(user?.name || '');
  const [password,    setPassword]    = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [saving,      setSaving]      = useState(false);
  const [msg,         setMsg]         = useState('');
  const [msgType,     setMsgType]     = useState('');
  const [activeTab,   setActiveTab]   = useState('appearance');

  const isDark   = settings.darkMode;
  const accent   = ACCENT_MAP[settings.accentColor] || ACCENT_MAP.gold;

  const t = {
    bg:          isDark ? '#0f0f1e' : '#f7f7fa',
    card:        isDark ? '#1a1a2e' : '#ffffff',
    border:      isDark ? 'rgba(255,255,255,0.08)' : '#eee',
    text:        isDark ? '#f0f0f0' : '#1a1a2e',
    subtext:     isDark ? 'rgba(255,255,255,0.45)' : '#888',
    inputBg:     isDark ? '#0f0f1e' : '#f7f7fa',
    inputBorder: isDark ? 'rgba(255,255,255,0.12)' : '#ddd',
  };

  async function saveProfile() {
    if (password && password !== confirmPass) { setMsg('Passwords do not match.'); setMsgType('error'); return; }
    setSaving(true); setMsg('');
    try {
      await API.patch('/auth/profile', { name, password: password || undefined });
      setMsg('Profile updated successfully.'); setMsgType('success');
      setPassword(''); setConfirmPass('');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to save.'); setMsgType('error');
    } finally { setSaving(false); }
  }

  const tabs = [
    { key: 'appearance',    label: 'Appearance',    icon: '🎨' },
    { key: 'account',       label: 'Account',       icon: '👤' },
    { key: 'accessibility', label: 'Accessibility', icon: '♿' },
  ];

  const Toggle = ({ value, onToggle }) => (
    <button onClick={onToggle}
      style={{ width:50, height:26, borderRadius:13, border:'none', cursor:'pointer', position:'relative',
        background: value ? accent.primary : t.inputBorder, transition:'background 0.25s', flexShrink:0 }}>
      <div style={{ position:'absolute', top:3, width:20, height:20, borderRadius:'50%', background:'white',
        boxShadow:'0 1px 4px rgba(0,0,0,0.2)', transition:'transform 0.25s',
        transform: value ? 'translateX(24px)' : 'translateX(2px)' }} />
    </button>
  );

  return (
    <div style={{ minHeight:'100vh', background:t.bg, color:t.text, fontFamily:'inherit', paddingBottom:60 }}>
      <style>{`
        .tab-active { background: linear-gradient(135deg,${accent.primary},${accent.hover}) !important; color: ${accent.text} !important; }
        .tab-btn:hover { opacity: 0.85; }
        .opt-active { background: linear-gradient(135deg,${accent.primary},${accent.hover}) !important; color: ${accent.text} !important; border-color: ${accent.primary} !important; }
        .save-profile-btn:hover { opacity:0.88; }
        .logout-btn:hover { background: #fde8e8 !important; }
        .reset-btn:hover { background: #eee !important; }
      `}</style>

      <div style={{ background:'linear-gradient(135deg,#0f0f1e,#1a1a2e)', padding:'28px 32px' }}>
        <div style={{ display:'inline-block', background:`linear-gradient(135deg,${accent.primary},${accent.hover})`, color:accent.text, fontWeight:'bold', fontSize:10, letterSpacing:2, padding:'2px 10px', borderRadius:4, marginBottom:8 }}>SETTINGS</div>
        <h1 style={{ margin:0, color:'white', fontSize:28, fontWeight:700 }}>Settings</h1>
        <p style={{ margin:'6px 0 0', color:'rgba(255,255,255,0.5)', fontSize:14 }}>Customize your StudyHub experience</p>
      </div>

      <div style={{ display:'flex', gap:24, padding:'32px', maxWidth:960, margin:'0 auto', alignItems:'flex-start', flexWrap:'wrap' }}>

        {/* Sidebar */}
        <div style={{ borderRadius:16, padding:'8px', display:'flex', flexDirection:'column', gap:4, minWidth:180, flexShrink:0, background:t.card, border:`1px solid ${t.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
          {tabs.map(tab => (
            <button key={tab.key} className={`tab-btn${activeTab === tab.key ? ' tab-active' : ''}`}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 16px', borderRadius:10, border:'none', cursor:'pointer', fontSize:14, fontWeight:600, fontFamily:'inherit', background:'transparent', color:t.text, transition:'all 0.18s', textAlign:'left' }}
              onClick={() => setActiveTab(tab.key)}>
              <span style={{ fontSize:18 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:20 }}>

          {/* ── APPEARANCE ── */}
          {activeTab === 'appearance' && (<>

            {/* Dark Mode */}
            <div style={{ borderRadius:16, padding:'22px 24px', background:t.card, border:`1px solid ${t.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:16, fontWeight:700, color:t.text }}>Dark Mode</div>
                  <div style={{ fontSize:13, color:t.subtext }}>Switch between light and dark interface</div>
                </div>
                <Toggle value={settings.darkMode} onToggle={() => update('darkMode', !settings.darkMode)} />
              </div>
              <div style={{ display:'flex', gap:14 }}>
                {[{ dark:false, label:'Light' }, { dark:true, label:'Dark' }].map(opt => (
                  <div key={opt.label} onClick={() => update('darkMode', opt.dark)}
                    style={{ flex:1, borderRadius:12, padding:'16px 14px', cursor:'pointer',
                      background: opt.dark ? '#0f0f1e' : '#f7f7fa',
                      border: `2px solid ${settings.darkMode === opt.dark ? accent.primary : 'transparent'}`,
                      transition:'border-color 0.2s' }}>
                    <div style={{ height:8, width:'60%', background: opt.dark ? accent.primary : '#1a1a2e', borderRadius:4, marginBottom:6 }} />
                    <div style={{ height:6, width:'80%', background: opt.dark ? '#333' : '#ddd', borderRadius:4, marginBottom:4 }} />
                    <div style={{ height:6, width:'50%', background: opt.dark ? '#333' : '#ddd', borderRadius:4 }} />
                    <p style={{ fontSize:12, color: opt.dark ? '#aaa' : '#888', marginTop:8, marginBottom:0 }}>{opt.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div style={{ borderRadius:16, padding:'22px 24px', background:t.card, border:`1px solid ${t.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize:16, fontWeight:700, color:t.text, marginBottom:4 }}>Accent Color</div>
              <div style={{ fontSize:13, color:t.subtext, marginBottom:16 }}>Applied to buttons, cards and highlights</div>
              <div style={{ display:'flex', gap:16 }}>
                {ACCENTS.map(a => (
                  <button key={a.key} onClick={() => update('accentColor', a.key)}
                    style={{ width:44, height:44, borderRadius:'50%', border:'none', cursor:'pointer',
                      background:a.color, transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center',
                      boxShadow: settings.accentColor === a.key ? `0 0 0 3px ${t.card}, 0 0 0 5px ${a.color}` : 'none',
                      transform: settings.accentColor === a.key ? 'scale(1.15)' : 'scale(1)' }}>
                    {settings.accentColor === a.key && <span style={{ color:'white', fontSize:18, fontWeight:900, textShadow:'0 1px 3px rgba(0,0,0,0.3)' }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div style={{ borderRadius:16, padding:'22px 24px', background:t.card, border:`1px solid ${t.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize:16, fontWeight:700, color:t.text, marginBottom:4 }}>Font Size</div>
              <div style={{ fontSize:13, color:t.subtext, marginBottom:16 }}>Adjust the base text size across the app</div>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                {FONT_SIZES.map(f => (
                  <button key={f.key} className={settings.fontSize === f.key ? 'opt-active' : ''}
                    onClick={() => update('fontSize', f.key)}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'12px 18px',
                      borderRadius:10, cursor:'pointer', fontFamily:'inherit', border:`1.5px solid ${t.inputBorder}`,
                      background:t.inputBg, color:t.text, transition:'all 0.18s', minWidth:72 }}>
                    <span style={{ fontSize: FONT_SIZE_MAP[f.key], fontWeight:700 }}>A</span>
                    <span style={{ fontSize:12 }}>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div style={{ borderRadius:16, padding:'22px 24px', background:t.card, border:`1px solid ${t.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize:16, fontWeight:700, color:t.text, marginBottom:4 }}>Font Style</div>
              <div style={{ fontSize:13, color:t.subtext, marginBottom:16 }}>Choose your preferred reading font</div>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                {FONT_FAMILIES.map(f => (
                  <button key={f.key} className={settings.fontFamily === f.key ? 'opt-active' : ''}
                    onClick={() => update('fontFamily', f.key)}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'12px 20px',
                      borderRadius:10, cursor:'pointer', border:`1.5px solid ${t.inputBorder}`,
                      background:t.inputBg, color:t.text, transition:'all 0.18s', minWidth:80,
                      fontFamily: f.key === 'serif' ? 'Georgia,serif' : f.key === 'mono' ? 'monospace' : 'inherit' }}>
                    <span style={{ fontSize:24, fontWeight:700 }}>Aa</span>
                    <span style={{ fontSize:12 }}>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Mode */}
            <div style={{ borderRadius:16, padding:'22px 24px', background:t.card, border:`1px solid ${t.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
                <div>
                  <div style={{ fontSize:16, fontWeight:700, color:t.text }}>Compact Mode</div>
                  <div style={{ fontSize:13, color:t.subtext }}>Reduce spacing to fit more content on screen</div>
                </div>
                <Toggle value={settings.compactMode} onToggle={() => update('compactMode', !settings.compactMode)} />
              </div>
            </div>

          </>)}

          {/* ── ACCOUNT ── */}
          {activeTab === 'account' && (<>
            <div style={{ borderRadius:16, padding:'22px 24px', background:t.card, border:`1px solid ${t.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize:16, fontWeight:700, color:t.text, marginBottom:16 }}>Profile</div>
              {user ? (<>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, padding:14, background:`${accent.primary}15`, borderRadius:12 }}>
                  <div style={{ width:48, height:48, borderRadius:'50%', background:`linear-gradient(135deg,${accent.primary},${accent.hover})`, color:accent.text, fontWeight:900, fontSize:20, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, color:t.text }}>{user.name}</div>
                    <div style={{ fontSize:13, color:t.subtext }}>{user.email}</div>
                    <div style={{ fontSize:12, color:t.subtext, marginTop:2, textTransform:'capitalize' }}>via {user.provider}</div>
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:6, color:t.subtext }}>Display Name</label>
                  <input style={{ width:'100%', padding:'10px 14px', borderRadius:10, fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box', background:t.inputBg, border:`1.5px solid ${t.inputBorder}`, color:t.text }}
                    value={name} onChange={e => setName(e.target.value)} />
                </div>
                {user.provider === 'email' && (<>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:6, color:t.subtext }}>New Password</label>
                    <input type="password" style={{ width:'100%', padding:'10px 14px', borderRadius:10, fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box', background:t.inputBg, border:`1.5px solid ${t.inputBorder}`, color:t.text }}
                      value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:6, color:t.subtext }}>Confirm Password</label>
                    <input type="password" style={{ width:'100%', padding:'10px 14px', borderRadius:10, fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box', background:t.inputBg, border:`1.5px solid ${t.inputBorder}`, color:t.text }}
                      value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
                  </div>
                </>)}
                {msg && <div style={{ borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:14, background: msgType==='success'?'#f0fdf4':'#fef2f2', color: msgType==='success'?'#15803d':'#dc2626', border:`1px solid ${msgType==='success'?'#bbf7d0':'#fca5a5'}` }}>{msg}</div>}
                <button className="save-profile-btn"
                  style={{ padding:'11px 26px', borderRadius:10, background:`linear-gradient(135deg,${accent.primary},${accent.hover})`, color:accent.text, border:'none', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}
                  onClick={saveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              </>) : (
                <p style={{ color:t.subtext, fontSize:14 }}>Sign in to manage your profile.</p>
              )}
            </div>

            {user && (
              <div style={{ borderRadius:16, padding:'22px 24px', background:t.card, border:'1px solid #fca5a5', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize:16, fontWeight:700, color:'#dc2626', marginBottom:4 }}>Sign Out</div>
                <div style={{ fontSize:13, color:t.subtext, marginBottom:16 }}>You will be logged out of your account.</div>
                <button className="logout-btn"
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:10, background:'#fef2f2', color:'#dc2626', border:'1.5px solid #fca5a5', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.18s' }}
                  onClick={logout}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
                </button>
              </div>
            )}
          </>)}

          {/* ── ACCESSIBILITY ── */}
          {activeTab === 'accessibility' && (<>
            {[
              { key:'reduceMotion', label:'Reduce Motion', sub:'Disable all animations and transitions' },
              { key:'highContrast', label:'High Contrast',  sub:'Increase contrast for better readability' },
            ].map(opt => (
              <div key={opt.key} style={{ borderRadius:16, padding:'22px 24px', background:t.card, border:`1px solid ${t.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
                  <div>
                    <div style={{ fontSize:16, fontWeight:700, color:t.text }}>{opt.label}</div>
                    <div style={{ fontSize:13, color:t.subtext }}>{opt.sub}</div>
                  </div>
                  <Toggle value={!!settings[opt.key]} onToggle={() => update(opt.key, !settings[opt.key])} />
                </div>
              </div>
            ))}

            <div style={{ borderRadius:16, padding:'22px 24px', background:t.card, border:`1px solid ${t.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize:16, fontWeight:700, color:t.text, marginBottom:4 }}>Reset All Settings</div>
              <div style={{ fontSize:13, color:t.subtext, marginBottom:16 }}>Restore all settings to their defaults</div>
              <button className="reset-btn"
                style={{ padding:'10px 20px', borderRadius:10, background:'#f5f5f7', color:'#666', border:'none', fontSize:14, cursor:'pointer', fontFamily:'inherit', transition:'all 0.18s' }}
                onClick={() => { localStorage.removeItem('studyhub_settings'); window.location.reload(); }}>
                Reset to Defaults
              </button>
            </div>
          </>)}

        </div>
      </div>
    </div>
  );
}
