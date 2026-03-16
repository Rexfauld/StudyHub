import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

const COURSES = [
  { label: "Computer Science",     icon: "💻" },
  { label: "General Science",      icon: "🔬" },
  { label: "STEM",                 icon: "🧪" },
  { label: "Agricultural Science", icon: "🌱" },
  { label: "General Arts",         icon: "🎨" },
  { label: "Visual Arts",          icon: "🖌️" },
  { label: "Home Economics",       icon: "🏠" },
  { label: "Business",             icon: "📊" },
];

export default function SHS() {
  const { settings } = useSettings();
  const navigate     = useNavigate();
  const [search, setSearch] = useState("");

  const accent      = { gold:"#e8b84b", blue:"#3b82f6", green:"#22c55e", rose:"#f43f5e" }[settings.accentColor] || "#e8b84b";
  const accentHover = { gold:"#c8980a", blue:"#1d4ed8", green:"#15803d", rose:"#be123c" }[settings.accentColor] || "#c8980a";
  const accentText  = { gold:"#1a1a2e", blue:"#fff",    green:"#fff",    rose:"#fff"    }[settings.accentColor] || "#1a1a2e";

  const isDark = settings.darkMode;
  const t = {
    bg:   isDark ? "#0f0f1e" : "#f7f7fa",
    sub:  isDark ? "rgba(255,255,255,0.4)" : "#aaa",
  };

  const filtered = COURSES.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));

  const css = `
    @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    .shs-course-card:hover { transform:translateY(-4px) !important; box-shadow:0 12px 30px rgba(0,0,0,0.2) !important; filter:brightness(1.08); }
  `;

  return (
    <div style={{ minHeight:"100vh", background:t.bg, paddingBottom:60 }}>
      <style>{css}</style>

      <div style={{ background:"linear-gradient(135deg,#0f0f1e,#1a1a2e)", padding:"28px 32px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
        <div>
          <div style={{ display:"inline-block", background:`linear-gradient(135deg,${accent},${accentHover})`, color:accentText, fontWeight:"bold", fontSize:10, letterSpacing:2, padding:"2px 10px", borderRadius:4, marginBottom:6 }}>SHS</div>
          <h1 style={{ margin:0, color:"white", fontSize:28, fontWeight:700, letterSpacing:"-0.5px" }}>Courses</h1>
          <p style={{ margin:"6px 0 0", color:"rgba(255,255,255,0.5)", fontSize:14 }}>Choose your SHS course to access study materials</p>
        </div>
        <div style={{ position:"relative", marginTop:4 }}>
          <svg style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input style={{ padding:"9px 14px 9px 36px", borderRadius:10, border:"1.5px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.1)", color:"white", fontSize:14, outline:"none", fontFamily:"inherit", width:220 }}
            placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))", gap:16, padding:"28px", maxWidth:960, margin:"0 auto" }}>
        {filtered.map((course, i) => (
          <button key={course.label} className="shs-course-card"
            style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, padding:"28px 16px 20px", background:`linear-gradient(135deg,${accent},${accentHover})`, border:"2px solid transparent", borderRadius:16, cursor:"pointer", boxShadow:"0 4px 16px rgba(0,0,0,0.12)", animation:"fadeUp 0.4s ease both", transition:"all 0.18s", fontFamily:"inherit", animationDelay:`${i*55}ms` }}
            onClick={() => navigate(`/shs/${encodeURIComponent(course.label)}`)}>
            <span style={{ fontSize:38 }}>{course.icon}</span>
            <span style={{ fontSize:15, fontWeight:700, color:accentText, textAlign:"center", lineHeight:1.3 }}>{course.label}</span>
            <span style={{ fontSize:12, color:`${accentText}88`, marginTop:2 }}>View subjects →</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p style={{ gridColumn:"1/-1", textAlign:"center", color:t.sub, marginTop:40, fontSize:15 }}>No courses match "{search}"</p>
        )}
      </div>
    </div>
  );
}
