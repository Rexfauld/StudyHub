import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import FileViewer from '../components/FileViewer';
import { useSettings } from "../context/SettingsContext";
import SignInModal from "../components/SignInModal";
import UploadModal from "../components/UploadModal";
import { useToast } from "../context/ToastContext";
import FileCard from "../components/FileCard";
import API from "../api";

const SUBJECTS = ["Mathematics","Integrated Science","English Language","Career","Computing","Social Studies","RME","Asante Twi","French"];
const SECTIONS  = ["Topic / Simplified","Book","Questions"];
const ICONS     = { Mathematics:"📐","Integrated Science":"🔬","English Language":"📖",Career:"💼",Computing:"💻","Social Studies":"🌍",RME:"🕊️","Asante Twi":"🗣️",French:"🥐" };
const SECTION_ICONS = { "Topic / Simplified":"💡", Book:"📚", Questions:"❓" };
const SECTION_DESC  = { "Topic / Simplified":"Simplified notes and topic summaries", Book:"Complete textbooks and references", Questions:"Past questions and practice tests" };

export default function JHS() {
  const { user }     = useAuth();
  const { settings } = useSettings();
  const toast        = useToast();

  const accent      = { gold:"#e8b84b", blue:"#3b82f6", green:"#22c55e", rose:"#f43f5e" }[settings.accentColor] || "#e8b84b";
  const accentHover = { gold:"#c8980a", blue:"#1d4ed8", green:"#15803d", rose:"#be123c" }[settings.accentColor] || "#c8980a";
  const accentText  = { gold:"#1a1a2e", blue:"#fff",    green:"#fff",    rose:"#fff"    }[settings.accentColor] || "#1a1a2e";

  const isDark = settings.darkMode;
  const t = {
    bg:       isDark ? "#0f0f1e" : "#f7f7fa",
    card:     isDark ? "#1a1a2e" : "#ffffff",
    cardHov:  isDark ? "#232340" : "#ffffff",
    text:     isDark ? "#f0f0f0" : "#1a1a2e",
    sub:      isDark ? "rgba(255,255,255,0.45)" : "#999",
    border:   isDark ? "rgba(255,255,255,0.08)" : "#eee",
    iconBg:   isDark ? "#0f0f1e"  : "#f3f3f8",
    iconStroke: isDark ? "#aaa"   : "#1a1a2e",
    dropBg:   isDark ? "#1a1a2e" : "#ffffff",
    dropBorder: isDark ? "rgba(255,255,255,0.12)" : "#ddd",
    statIcon: isDark ? "rgba(255,255,255,0.25)" : "#bbb",
    likeOff:  isDark ? "rgba(255,255,255,0.15)" : "#eee",
  };

  const [search,        setSearch]        = useState("");
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [files,         setFiles]         = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [uploadModal,   setUploadModal]   = useState(false);
  const [authModal,     setAuthModal]     = useState(false);
  const [viewingFile,   setViewingFile]   = useState(null);
  const [error,         setError]         = useState("");
  const fileInputRef = useRef();

  const filtered = SUBJECTS.filter(sub => sub.toLowerCase().includes(search.toLowerCase()));

  async function openSection(sec) {
    setActiveSection(sec); setLoading(true); setError("");
    try {
      const slug    = `jhs-${activeSubject.toLowerCase().replace(/\s+/g,"-")}`;
      const typeMap = { "Topic / Simplified":"topic", Book:"book", Questions:"questions" };
      const res     = await API.get(`/uploads?subjectSlug=${slug}&type=${typeMap[sec]}&status=approved`);
      setFiles(res.data.uploads || []);
    } catch { setError("Failed to load files."); }
    finally  { setLoading(false); }
  }

  async function handleDownload(file) {
    if (!user) { setAuthModal(true); return; }
    try { await API.post(`/uploads/${file._id}/download`); } catch {}
    window.open(file.fileUrl, '_blank');
    setFiles(prev => prev.map(f => f._id === file._id ? { ...f, downloads: (f.downloads || 0) + 1 } : f));
  }

  async function handleLike(fileId) {
    if (!user) { setAuthModal(true); return; }
    try {
      const res = await API.post(`/uploads/${fileId}/like`);
      setFiles(prev => prev.map(f => f._id === fileId
        ? { ...f, likes: Array(res.data.likes).fill(null), _liked: res.data.liked } : f));
    } catch {}
  }

  function goBack() {
    if (activeSection) { setActiveSection(null); setFiles([]); }
    else { setActiveSubject(null); setActiveSection(null); }
  }

  const css = `
    @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin   { to{transform:rotate(360deg)} }
    .jhs-subject-card:hover { transform:translateY(-4px) !important; box-shadow:0 12px 30px rgba(0,0,0,0.18) !important; }
    .jhs-section-card:hover { border-color:${accent} !important; box-shadow:0 8px 24px rgba(0,0,0,0.12) !important; background:${t.cardHov} !important; }
    .jhs-dropzone:hover     { border-color:${accent} !important; }
    .jhs-file-card:hover    { transform:translateY(-3px) !important; box-shadow:0 8px 24px rgba(0,0,0,0.15) !important; }
    .jhs-dl-btn:hover       { opacity:0.85 !important; }
    .jhs-back-btn:hover     { background:rgba(255,255,255,0.18) !important; }
    @media (max-width:600px) {
      .jhs-page-header  { padding:20px 16px !important; }
      .jhs-subject-grid { grid-template-columns:repeat(auto-fill,minmax(140px,1fr)) !important; padding:16px !important; gap:12px !important; }
      .jhs-section-wrapper { padding:0 12px !important; margin-top:20px !important; }
      .jhs-file-area    { padding:0 12px !important; margin-top:20px !important; }
      .jhs-file-grid    { grid-template-columns:1fr 1fr !important; gap:10px !important; }
      .jhs-file-buttons { flex-wrap:wrap !important; }
      .jhs-like-btn     { flex:none !important; width:100% !important; justify-content:center !important; }
      .jhs-dropzone     { padding:24px 16px !important; }
    }
  `;

  return (
    <div style={{ minHeight:"100vh", background:t.bg, paddingBottom:60 }}>
      <style>{css}</style>

      {/* ── Page header ── */}
      <div className="jhs-page-header" style={{ background:"linear-gradient(135deg,#0f0f1e,#1a1a2e)", padding:"28px 28px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
          {(activeSubject || activeSection) && (
            <button className="jhs-back-btn" style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.1)", border:"none", color:"rgba(255,255,255,0.85)", fontSize:14, cursor:"pointer", borderRadius:8, padding:"7px 14px", fontFamily:"inherit", marginTop:4, flexShrink:0 }} onClick={goBack}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>Back
            </button>
          )}
          <div>
            <div style={{ display:"inline-block", background:`linear-gradient(135deg,${accent},${accentHover})`, color:accentText, fontWeight:"bold", fontSize:10, letterSpacing:2, padding:"2px 10px", borderRadius:4, marginBottom:6 }}>JHS</div>
            <h1 style={{ margin:0, color:"white", fontSize:"clamp(20px,5vw,28px)", fontWeight:700, letterSpacing:"-0.5px" }}>
              {activeSection ? activeSection : activeSubject ? activeSubject : "Subjects"}
            </h1>
            {activeSubject && !activeSection && <p style={{ margin:"6px 0 0", color:"rgba(255,255,255,0.5)", fontSize:14 }}>Choose a section to view materials</p>}
          </div>
        </div>
        {!activeSubject && (
          <div style={{ position:"relative", width:"100%", maxWidth:260 }}>
            <svg style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input style={{ padding:"9px 14px 9px 36px", borderRadius:10, border:"1.5px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.1)", color:"white", fontSize:14, outline:"none", fontFamily:"inherit", width:"100%", boxSizing:"border-box" }}
              placeholder="Search subjects…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}
      </div>

      {/* ── Subjects grid ── */}
      {!activeSubject && (
        <div className="jhs-subject-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:16, padding:"24px", maxWidth:960, margin:"0 auto" }}>
          {filtered.map((subject, i) => (
            <button key={subject} className="jhs-subject-card"
              style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, padding:"24px 14px 18px", background:`linear-gradient(135deg,${accent},${accentHover})`, border:"2px solid transparent", borderRadius:16, cursor:"pointer", boxShadow:"0 4px 18px rgba(0,0,0,0.12)", animation:"fadeUp 0.4s ease both", transition:"all 0.18s", fontFamily:"inherit", animationDelay:`${i*55}ms` }}
              onClick={() => { setActiveSubject(subject); setActiveSection(null); }}>
              <span style={{ fontSize:34 }}>{ICONS[subject]}</span>
              <span style={{ fontSize:13, fontWeight:700, color:accentText, textAlign:"center", lineHeight:1.3 }}>{subject}</span>
              <span style={{ fontSize:13, color:`${accentText}88` }}>→</span>
            </button>
          ))}
          {filtered.length === 0 && <p style={{ gridColumn:"1/-1", textAlign:"center", color:t.sub, marginTop:40, fontSize:15 }}>No subjects match "{search}"</p>}
        </div>
      )}

      {/* ── Sections ── */}
      {activeSubject && !activeSection && (
        <div className="jhs-section-wrapper" style={{ maxWidth:580, margin:"28px auto", padding:"0 20px", display:"flex", flexDirection:"column", gap:12 }}>
          {SECTIONS.map((sec, i) => (
            <button key={sec} className="jhs-section-card"
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 20px", background:t.card, border:`2px solid ${t.border}`, borderRadius:14, cursor:"pointer", boxShadow:"0 4px 14px rgba(0,0,0,0.07)", animation:"fadeUp 0.4s ease both", transition:"all 0.18s", fontFamily:"inherit", animationDelay:`${i*80}ms` }}
              onClick={() => openSection(sec)}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:t.iconBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{SECTION_ICONS[sec]}</div>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:t.text, textAlign:"left" }}>{sec}</div>
                  <div style={{ fontSize:12, color:t.sub, marginTop:2, textAlign:"left" }}>{SECTION_DESC[sec]}</div>
                </div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.border} strokeWidth="2.5" style={{ flexShrink:0 }}><path d="m9 18 6-6-6-6"/></svg>
            </button>
          ))}
        </div>
      )}

      {/* ── File area ── */}
      {activeSubject && activeSection && (
        <div className="jhs-file-area" style={{ maxWidth:760, margin:"24px auto", padding:"0 20px" }}>
          <div className="jhs-dropzone"
            style={{ border:`2px dashed ${t.dropBorder}`, borderRadius:16, padding:"36px 20px", textAlign:"center", cursor:"pointer", background:t.dropBg, transition:"all 0.2s", marginBottom:20 }}
            onClick={() => { if (!user) { setAuthModal(true); return; } setUploadModal(true); }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
              <div style={{ width:56, height:56, borderRadius:16, background:t.iconBg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {user
                  ? <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={t.iconStroke} strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                }
              </div>
              {user
                ? <><p style={{ fontSize:15, fontWeight:600, color:t.text, margin:0 }}>Tap to upload files</p><p style={{ fontSize:13, color:t.sub, margin:0 }}>PDFs, images, documents — any format</p></>
                : <><p style={{ fontSize:15, fontWeight:600, color:t.text, margin:0 }}>Sign in to upload files</p><p style={{ fontSize:13, color:t.sub, margin:0 }}>You can view files below without signing in</p></>
              }
            </div>
          </div>

          {error && <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", color:"#dc2626", borderRadius:10, padding:"12px 16px", fontSize:14, marginBottom:16 }}>{error}</div>}

          {loading ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 0" }}>
              <div style={{ width:32, height:32, border:`3px solid ${t.border}`, borderTop:`3px solid ${accent}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
              <p style={{ color:t.sub, marginTop:12 }}>Loading files…</p>
            </div>
          ) : files.length > 0 ? (
            <div>
              <h3 style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:700, color:t.sub, marginBottom:14 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                {files.length} file{files.length > 1 ? "s" : ""}
              </h3>
              <div className="jhs-file-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:14 }}>
                {files.map((f, i) => (
                  <FileCard key={f._id || i} file={f} index={i}
                    accent={accent} accentText={accentText} isDark={isDark}
                    user={user}
                    onView={f => setViewingFile(f)}
                    onDownload={handleDownload}
                    onLike={handleLike}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"48px 0", gap:8 }}>
              <span style={{ fontSize:40 }}>📂</span>
              <p style={{ fontSize:16, fontWeight:600, color:t.sub, margin:0 }}>No files yet in this section.</p>
              <p style={{ fontSize:14, color:t.sub, margin:0, opacity:0.7 }}>Be the first to upload!</p>
            </div>
          )}
        </div>
      )}

      {viewingFile && <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />}
      <SignInModal open={authModal} onClose={() => setAuthModal(false)} />
      <UploadModal
        open={uploadModal}
        onClose={(success) => {
          setUploadModal(false);
          if (success) toast.success("Upload submitted — pending admin approval.");
        }}
        subjectSlug={`jhs-${activeSubject?.toLowerCase().replace(/\s+/g,"-")}`}
        defaultType={{ "Topic / Simplified":"topic", Book:"book", Questions:"questions" }[activeSection] || "topic"}
      />
    </div>
  );
}
