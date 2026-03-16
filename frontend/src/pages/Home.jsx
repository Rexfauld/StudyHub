import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const LEVELS = [
  { to: '/jhs', label: 'JHS', icon: '📚', desc: 'Junior High School', sub: 'Core subjects & study materials' },
  { to: '/shs', label: 'SHS', icon: '🎓', desc: 'Senior High School', sub: 'All SHS courses & past questions' },
  { to: '/university', label: 'University', icon: '🏛️', desc: 'Tertiary Education', sub: 'Degree programs & resources' },
];

export default function Home() {
  const { settings } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const accent      = { gold:"#e8b84b", blue:"#3b82f6", green:"#22c55e", rose:"#f43f5e" }[settings.accentColor] || "#e8b84b";
  const accentHover = { gold:"#c8980a", blue:"#1d4ed8", green:"#15803d", rose:"#be123c" }[settings.accentColor] || "#c8980a";
  const accentText  = { gold:"#1a1a2e", blue:"#fff",    green:"#fff",    rose:"#fff"    }[settings.accentColor] || "#1a1a2e";
  const isDark = settings.darkMode;

  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    API.get('/uploads/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const t = {
    bg:   isDark ? "#0a0a18" : "#f7f7fa",
    card: isDark ? "#1a1a2e" : "#ffffff",
    text: isDark ? "#f0f0f0" : "#1a1a2e",
    sub:  isDark ? "rgba(255,255,255,0.45)" : "#666",
    border: isDark ? "rgba(255,255,255,0.08)" : "#eee",
  };

  const css = `
    @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
    .level-card:hover { transform:translateY(-6px) !important; box-shadow:0 20px 48px rgba(0,0,0,0.18) !important; }
    .search-input:focus { border-color:${accent} !important; box-shadow:0 0 0 3px ${accent}30 !important; }
    .stat-card:hover { transform:translateY(-3px) !important; }
    .feature-card:hover { border-color:${accent} !important; transform:translateY(-3px) !important; }

    @media (max-width: 600px) {
      .home-hero { padding: 40px 16px 52px !important; }
      .home-hero h1 { font-size: 30px !important; }
      .home-stats { gap: 20px !important; }
      .home-section { padding: 32px 14px 0 !important; }
      .home-level-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
      .home-feature-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
      .home-cta { padding: 24px 16px !important; }
      .home-footer { padding: 24px 16px !important; }
    }
  `;

  return (
    <div style={{ minHeight:"100vh", background:t.bg }}>
      <style>{css}</style>

      {/* HERO */}
      <div style={{
        background:"linear-gradient(135deg,#0f0f1e 0%,#1a1a2e 60%,#0f1a2e 100%)",
        padding:"64px 32px 72px", textAlign:"center", position:"relative", overflow:"hidden"
      }}>
        {/* Background decoration */}
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle at 20% 50%, ${accent}18 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3b82f618 0%, transparent 40%)`, pointerEvents:"none" }} />

        <div style={{ position:"relative", maxWidth:700, margin:"0 auto" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:`${accent}20`, border:`1px solid ${accent}40`, borderRadius:50, padding:"6px 16px", marginBottom:24 }}>
            <span style={{ fontSize:14, animation:"pulse 2s ease infinite" }}>✨</span>
            <span style={{ color:accent, fontSize:13, fontWeight:600 }}>Ghana's Student Resource Platform</span>
          </div>

          <h1 style={{ margin:"0 0 16px", color:"white", fontSize:"clamp(32px,5vw,52px)", fontWeight:800, lineHeight:1.15, letterSpacing:"-1px" }}>
            Study Smarter,<br />
            <span style={{ background:`linear-gradient(135deg,${accent},${accentHover})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Achieve More
            </span>
          </h1>

          <p style={{ margin:"0 0 36px", color:"rgba(255,255,255,0.55)", fontSize:17, lineHeight:1.7, maxWidth:520, margin:"0 auto 36px" }}>
            Access free study materials, past questions, textbooks, and simplified notes for JHS, SHS, and University students.
          </p>

          {/* Search bar */}
          <div style={{ position:"relative", maxWidth:480, margin:"0 auto 32px" }}>
            <svg style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="search-input"
              style={{ width:"100%", padding:"14px 16px 14px 46px", borderRadius:14, border:"1.5px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.08)", color:"white", fontSize:15, outline:"none", fontFamily:"inherit", boxSizing:"border-box", transition:"all 0.2s" }}
              placeholder="Search for topics, subjects, past questions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`); }}
            />
            <button
              onClick={() => search.trim() && navigate(`/search?q=${encodeURIComponent(search.trim())}`)}
              style={{ position:"absolute", right:6, top:"50%", transform:"translateY(-50%)", padding:"8px 18px", borderRadius:10, background:`linear-gradient(135deg,${accent},${accentHover})`, color:accentText, border:"none", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              Search
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div style={{ display:"flex", justifyContent:"center", gap:32, flexWrap:"wrap" }}>
              {[
                { label:"Files", value:stats.total },
                { label:"Approved", value:stats.approved },
                { label:"Students", value:stats.users },
              ].map(s => (
                <div key={s.label} style={{ textAlign:"center" }}>
                  <p style={{ margin:0, color:"white", fontSize:24, fontWeight:800 }}>{s.value?.toLocaleString()}</p>
                  <p style={{ margin:"2px 0 0", color:"rgba(255,255,255,0.4)", fontSize:12 }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LEVEL CARDS */}
      <div style={{ maxWidth:960, margin:"0 auto", padding:"48px 24px 0" }}>
        <h2 style={{ textAlign:"center", color:t.text, fontSize:22, fontWeight:700, margin:"0 0 8px" }}>Choose Your Level</h2>
        <p style={{ textAlign:"center", color:t.sub, fontSize:14, margin:"0 0 32px" }}>Select your education level to get started</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:20 }}>
          {LEVELS.map((level, i) => (
            <Link key={level.to} to={level.to} className="level-card"
              style={{
                display:"flex", alignItems:"center", gap:18,
                padding:"28px 24px", borderRadius:18,
                background:hovered === level.to ? `linear-gradient(135deg,${accent},${accentHover})` : t.card,
                border:`2px solid ${hovered === level.to ? "transparent" : t.border}`,
                boxShadow:"0 4px 20px rgba(0,0,0,0.07)",
                textDecoration:"none", transition:"all 0.22s",
                animation:`fadeUp 0.4s ease both`, animationDelay:`${i*80}ms`
              }}
              onMouseEnter={() => setHovered(level.to)}
              onMouseLeave={() => setHovered(null)}>
              <div style={{ width:56, height:56, borderRadius:16, background: hovered === level.to ? "rgba(255,255,255,0.15)" : isDark ? "rgba(255,255,255,0.06)" : "#f3f3f8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>
                {level.icon}
              </div>
              <div>
                <p style={{ margin:0, fontWeight:800, fontSize:18, color: hovered === level.to ? accentText : t.text }}>{level.desc}</p>
                <p style={{ margin:"4px 0 0", fontSize:13, color: hovered === level.to ? `${accentText}99` : t.sub }}>{level.sub}</p>
              </div>
              <svg style={{ marginLeft:"auto", flexShrink:0 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={hovered === level.to ? accentText : "#ccc"} strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ maxWidth:960, margin:"0 auto", padding:"48px 24px 0" }}>
        <h2 style={{ textAlign:"center", color:t.text, fontSize:22, fontWeight:700, margin:"0 0 8px" }}>Why StudyHub?</h2>
        <p style={{ textAlign:"center", color:t.sub, fontSize:14, margin:"0 0 32px" }}>Everything you need to succeed academically</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16 }}>
          {[
            { icon:"📄", title:"Past Questions", desc:"Access years of past exam questions to practice and prepare" },
            { icon:"📖", title:"Textbooks", desc:"Full textbooks and reference materials at your fingertips" },
            { icon:"💡", title:"Simplified Notes", desc:"Topic summaries that make complex subjects easy to understand" },
            { icon:"⬆️", title:"Community Upload", desc:"Share your own materials and help fellow students" },
          ].map((f, i) => (
            <div key={f.title} className="feature-card"
              style={{ padding:"24px 20px", borderRadius:16, background:t.card, border:`1.5px solid ${t.border}`, transition:"all 0.18s", animation:`fadeUp 0.4s ease both`, animationDelay:`${i*70}ms` }}>
              <div style={{ fontSize:32, marginBottom:12 }}>{f.icon}</div>
              <p style={{ margin:"0 0 8px", fontWeight:700, color:t.text, fontSize:15 }}>{f.title}</p>
              <p style={{ margin:0, color:t.sub, fontSize:13, lineHeight:1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {!user && (
        <div style={{ maxWidth:600, margin:"48px auto 0", padding:"0 24px", textAlign:"center" }}>
          <div style={{ background:`linear-gradient(135deg,#0f0f1e,#1a1a2e)`, borderRadius:20, padding:"40px 32px" }}>
            <h2 style={{ margin:"0 0 10px", color:"white", fontSize:22, fontWeight:800 }}>Join the Community</h2>
            <p style={{ margin:"0 0 24px", color:"rgba(255,255,255,0.5)", fontSize:14, lineHeight:1.7 }}>Sign in to upload materials, help fellow students, and contribute to Ghana's largest student resource library.</p>
            <Link to="/" style={{ display:"inline-block", padding:"13px 32px", borderRadius:12, background:`linear-gradient(135deg,${accent},${accentHover})`, color:accentText, textDecoration:"none", fontSize:15, fontWeight:700 }}>
              Get Started →
            </Link>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ marginTop:64, borderTop:`1px solid ${t.border}`, padding:"32px 24px", textAlign:"center" }}>
        <p style={{ margin:"0 0 8px", fontWeight:700, color:t.text, fontSize:15 }}>StudyHub</p>
        <p style={{ margin:"0 0 16px", color:t.sub, fontSize:13 }}>Empowering Ghanaian students with free academic resources</p>
        <div style={{ display:"flex", justifyContent:"center", gap:24, flexWrap:"wrap", marginBottom:16 }}>
          {[{to:"/jhs",label:"JHS"},{to:"/shs",label:"SHS"},{to:"/university",label:"University"},{to:"/settings",label:"Settings"}].map(l => (
            <Link key={l.to} to={l.to} style={{ color:t.sub, textDecoration:"none", fontSize:13, transition:"color 0.15s" }}>{l.label}</Link>
          ))}
        </div>
        <p style={{ margin:0, color:t.sub, fontSize:12 }}>© {new Date().getFullYear()} StudyHub. Built for students, by students.</p>
      </footer>
    </div>
  );
}
