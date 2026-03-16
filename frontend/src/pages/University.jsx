import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

const FACULTIES = [
  { label: "Business School",                          icon: "📈" },
  { label: "Applied Sciences and Technology",          icon: "🔬" },
  { label: "Built and Natural Environment",            icon: "🏗️" },
  { label: "Creative Arts and Technology",             icon: "🎨" },
  { label: "Engineering and Technology",               icon: "⚙️" },
  { label: "Entrepreneurship and Enterprise Development", icon: "💡" },
  { label: "Health Sciences",                          icon: "🏥" },
  { label: "Graduate School",                          icon: "🎓" },
];

export default function University() {
  const navigate     = useNavigate();
  const { settings } = useSettings();

  const accent      = { gold:"#e8b84b", blue:"#3b82f6", green:"#22c55e", rose:"#f43f5e" }[settings.accentColor] || "#e8b84b";
  const accentHover = { gold:"#c8980a", blue:"#1d4ed8", green:"#15803d", rose:"#be123c" }[settings.accentColor] || "#c8980a";
  const accentText  = { gold:"#1a1a2e", blue:"#fff",    green:"#fff",    rose:"#fff"    }[settings.accentColor] || "#1a1a2e";

  const isDark = settings.darkMode;
  const t = {
    bg:    isDark ? "#0f0f1e" : "#f7f7fa",
    card:  isDark ? "#1a1a2e" : "#ffffff",
    text:  isDark ? "#f0f0f0" : "#1a1a2e",
    sub:   isDark ? "rgba(255,255,255,0.4)" : "#aaa",
    border: isDark ? "rgba(255,255,255,0.08)" : "#e8e8f0",
    arrow: isDark ? "rgba(255,255,255,0.3)"  : "#ccc",
  };

  const css = `
    @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    .uni-faculty-card:hover {
      transform:translateY(-3px) !important;
      box-shadow:0 10px 28px rgba(0,0,0,0.13) !important;
      border-color:${accent} !important;
    }
  `;

  return (
    <div style={{ minHeight:"100vh", background:t.bg, paddingBottom:60 }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#0f0f1e,#1a1a2e)", padding:"28px 32px" }}>
        <div style={{ display:"inline-block", background:`linear-gradient(135deg,${accent},${accentHover})`, color:accentText, fontWeight:"bold", fontSize:10, letterSpacing:2, padding:"2px 10px", borderRadius:4, marginBottom:8 }}>UNIVERSITY</div>
        <h1 style={{ margin:0, color:"white", fontSize:28, fontWeight:700, letterSpacing:"-0.5px" }}>Faculties</h1>
        <p style={{ margin:"6px 0 0", color:"rgba(255,255,255,0.5)", fontSize:14 }}>Choose a faculty to explore departments and programs</p>
      </div>

      {/* Faculty grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:14, padding:"32px", maxWidth:1000, margin:"0 auto" }}>
        {FACULTIES.map((faculty, i) => (
          <button key={faculty.label} className="uni-faculty-card"
            style={{ display:"flex", alignItems:"center", gap:14, padding:"20px 22px", background:t.card, border:`1.5px solid ${t.border}`, borderRadius:14, cursor:"pointer", boxShadow:"0 2px 12px rgba(0,0,0,0.07)", animation:"fadeUp 0.4s ease both", transition:"all 0.18s", fontFamily:"inherit", animationDelay:`${i*60}ms`, textAlign:"left" }}
            onClick={() => navigate(`/faculty/${encodeURIComponent(faculty.label)}`)}>
            <div style={{ width:46, height:46, borderRadius:12, background: isDark ? "#0f0f1e" : "#f3f3f8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
              {faculty.icon}
            </div>
            <span style={{ fontSize:14, fontWeight:700, color:t.text, lineHeight:1.4, flex:1 }}>{faculty.label}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.arrow} strokeWidth="2.5" style={{ flexShrink:0 }}><path d="m9 18 6-6-6-6"/></svg>
          </button>
        ))}
      </div>
    </div>
  );
}
