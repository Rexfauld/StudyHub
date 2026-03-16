import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const accent      = { gold:"#e8b84b", blue:"#3b82f6", green:"#22c55e", rose:"#f43f5e" }[settings.accentColor] || "#e8b84b";
  const accentHover = { gold:"#c8980a", blue:"#1d4ed8", green:"#15803d", rose:"#be123c" }[settings.accentColor] || "#c8980a";
  const accentText  = { gold:"#1a1a2e", blue:"#fff",    green:"#fff",    rose:"#fff"    }[settings.accentColor] || "#1a1a2e";
  const isDark = settings.darkMode;

  const css = `
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .go-home:hover { background: ${accentHover} !important; transform: translateY(-2px) !important; }
    .go-back:hover { border-color: ${accent} !important; color: ${accent} !important; }
  `;

  return (
    <div style={{ minHeight:"100vh", background: isDark ? "#0f0f1e" : "#f7f7fa", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <style>{css}</style>
      <div style={{ textAlign:"center", animation:"fadeUp 0.4s ease both" }}>
        <div style={{ fontSize:96, animation:"float 3s ease-in-out infinite", marginBottom:8 }}>📭</div>
        <h1 style={{ margin:"0 0 8px", fontSize:72, fontWeight:900, color: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)", letterSpacing:"-4px" }}>404</h1>
        <h2 style={{ margin:"-20px 0 12px", fontSize:24, fontWeight:800, color: isDark ? "#f0f0f0" : "#1a1a2e" }}>Page Not Found</h2>
        <p style={{ margin:"0 0 32px", color: isDark ? "rgba(255,255,255,0.45)" : "#888", fontSize:15, lineHeight:1.6, maxWidth:360, margin:"0 auto 32px" }}>
          Looks like this page doesn't exist or was moved. Let's get you back on track.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button className="go-home"
            onClick={() => navigate('/')}
            style={{ padding:"12px 28px", borderRadius:12, background:`linear-gradient(135deg,${accent},${accentHover})`, color:accentText, border:"none", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all 0.18s" }}>
            🏠 Go Home
          </button>
          <button className="go-back"
            onClick={() => navigate(-1)}
            style={{ padding:"12px 28px", borderRadius:12, background:"transparent", color: isDark ? "rgba(255,255,255,0.6)" : "#666", border:`1.5px solid ${isDark ? "rgba(255,255,255,0.15)" : "#ddd"}`, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all 0.18s" }}>
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
