import { useEffect, useState, useCallback } from "react";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import API from "../api";

const TYPE_ICONS  = { topic:"💡", book:"📚", questions:"❓", other:"📄", photo:"🖼️" };

function fileIcon(fileName = "", fileUrl = "") {
  const f = fileName.toLowerCase();
  const u = fileUrl.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(f) || /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(u)) return "🖼️";
  if (/\.(mp4|webm|ogg)$/i.test(f))   return "🎬";
  if (/\.(mp3|wav|m4a)$/i.test(f))    return "🎵";
  if (/\.pdf$/i.test(f))              return "📄";
  if (/\.(doc|docx)$/i.test(f))       return "📝";
  if (/\.(ppt|pptx)$/i.test(f))       return "📊";
  if (/\.(xls|xlsx)$/i.test(f))       return "📈";
  return "📁";
}

function isImageUrl(fileName = "", fileUrl = "") {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName) ||
         /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(fileUrl);
}

// ── Thumbnail for related file cards ──────────────────────────────────────────
function FileThumbnail({ file, size = 56 }) {
  const [imgErr, setImgErr] = useState(false);
  const url  = file.fileUrl || "";
  const name = file.fileName || "";
  const isImg = isImageUrl(name, url) && !imgErr;

  return (
    <div style={{ width:size, height:size, borderRadius:10, overflow:"hidden", flexShrink:0, background:"#1e1e32", display:"flex", alignItems:"center", justifyContent:"center" }}>
      {isImg
        ? <img src={url} alt={file.title} onError={() => setImgErr(true)}
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        : <span style={{ fontSize: size * 0.4 }}>{fileIcon(name, url)}</span>
      }
    </div>
  );
}

// ── Main FileViewer ────────────────────────────────────────────────────────────
export default function FileViewer({ file: initialFile, onClose }) {
  const { settings } = useSettings();
  const { user }     = useAuth();

  const accent      = { gold:"#e8b84b", blue:"#3b82f6", green:"#22c55e", rose:"#f43f5e" }[settings.accentColor] || "#e8b84b";
  const accentHover = { gold:"#c8980a", blue:"#1d4ed8", green:"#15803d", rose:"#be123c" }[settings.accentColor] || "#c8980a";
  const accentText  = { gold:"#1a1a2e", blue:"#fff",    green:"#fff",    rose:"#fff"    }[settings.accentColor] || "#1a1a2e";
  const isDark = settings.darkMode;

  const t = {
    toolbar:  isDark ? "#12122b" : "#f7f7fa",
    sidebar:  isDark ? "#12122b" : "#f3f3f8",
    card:     isDark ? "#1a1a2e" : "#ffffff",
    cardHov:  isDark ? "#232348" : "#f0f0f6",
    text:     isDark ? "#f0f0f0" : "#1a1a2e",
    sub:      isDark ? "rgba(255,255,255,0.4)" : "#888",
    border:   isDark ? "rgba(255,255,255,0.08)" : "#e5e5e5",
    statClr:  isDark ? "rgba(255,255,255,0.3)" : "#bbb",
  };

  const [file,        setFile]        = useState(initialFile);
  const [loaded,      setLoaded]      = useState(false);
  const [related,     setRelated]     = useState([]);
  const [relLoading,  setRelLoading]  = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Reset loader when file changes
  useEffect(() => { setLoaded(false); }, [file]);

  // Fetch related files whenever file changes
  useEffect(() => {
    if (!file?.subjectSlug) return;
    setRelLoading(true);
    API.get(`/uploads?subjectSlug=${file.subjectSlug}&status=approved`)
      .then(res => {
        const others = (res.data.uploads || []).filter(u => u._id !== file._id);
        setRelated(others.slice(0, 12));
      })
      .catch(() => {})
      .finally(() => setRelLoading(false));
  }, [file?.subjectSlug, file?._id]);

  // Keyboard close
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!file) return null;

  const url      = file.fileUrl || "";
  const name     = file.title || file.fileName || "File";
  const fileName = (file.fileName || "").toLowerCase();
  const isImage  = isImageUrl(file.fileName || "", url);
  const isVideo  = /\.(mp4|webm|ogg)$/i.test(fileName) || /\.(mp4|webm|ogg)(\?|$)/i.test(url);
  const isAudio  = /\.(mp3|wav|ogg|m4a)$/i.test(fileName);
  const googleViewerUrl = (!isImage && !isVideo && !isAudio && url)
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
    : null;

  async function handleRelatedDownload(f) {
    if (!user) return;
    try { await API.post(`/uploads/${f._id}/download`); } catch {}
    window.open(f.fileUrl, "_blank");
  }

  // Subject label from slug
  const slugParts  = (file.subjectSlug || "").split("-");
  const LEVELS     = { jhs:"JHS", shs:"SHS", uni:"University" };
  const level      = LEVELS[slugParts[0]] || null;
  const subjectLabel = (level ? slugParts.slice(1) : slugParts).join(" ").replace(/\b\w/g, c => c.toUpperCase());

  const css = `
    @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes slideIn { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    .fv-close:hover   { background:rgba(255,255,255,0.18) !important; }
    .fv-dl:hover      { background:${accentHover} !important; }
    .rel-card:hover   { background:${t.cardHov} !important; }
    .sidebar-toggle:hover { background:rgba(255,255,255,0.12) !important; }
    @media (max-width:700px) {
      .fv-sidebar { display:none !important; }
      .fv-body    { flex-direction:column !important; }
    }
  `;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(10px)", display:"flex", flexDirection:"column", animation:"fadeIn 0.2s ease both" }}>
      <style>{css}</style>

      {/* ── Toolbar ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", background:t.toolbar, borderBottom:`1px solid ${t.border}`, gap:12, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
          <span style={{ fontSize:20, flexShrink:0 }}>{fileIcon(file.fileName || "", url)}</span>
          <div style={{ minWidth:0 }}>
            <p style={{ margin:0, fontWeight:700, color:t.text, fontSize:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"38vw" }}>{name}</p>
            <div style={{ display:"flex", gap:8, marginTop:2, flexWrap:"wrap" }}>
              {level && <span style={{ fontSize:11, color:accent, fontWeight:700 }}>{level}</span>}
              <span style={{ fontSize:11, color:t.sub }}>{subjectLabel}</span>
              {file.type && <span style={{ fontSize:11, color:t.sub }}>{TYPE_ICONS[file.type]} {file.type}</span>}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          {/* Sidebar toggle */}
          {related.length > 0 && (
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(v => !v)}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:8, background:"rgba(255,255,255,0.08)", border:"none", color:"rgba(255,255,255,0.7)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"background 0.15s" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
              {sidebarOpen ? "Hide" : `Related (${related.length})`}
            </button>
          )}
          <a href={url} target="_blank" rel="noreferrer" className="fv-dl"
            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:9, background:`linear-gradient(135deg,${accent},${accentHover})`, color:accentText, textDecoration:"none", fontSize:13, fontWeight:700, transition:"background 0.15s" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download
          </a>
          <button className="fv-close" onClick={onClose}
            style={{ width:34, height:34, borderRadius:9, background:"rgba(255,255,255,0.08)", border:"none", color:"white", fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s" }}>×</button>
        </div>
      </div>

      {/* ── Body: viewer + sidebar ── */}
      <div className="fv-body" style={{ flex:1, overflow:"hidden", display:"flex", minHeight:0 }}>

        {/* ── Viewer pane ── */}
        <div style={{ flex:1, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", padding: (isImage||isVideo||isAudio) ? 24 : 0, position:"relative", minWidth:0 }}>
          {/* Spinner */}
          {!loaded && (
            <div style={{ position:"absolute", display:"flex", flexDirection:"column", alignItems:"center", gap:12, zIndex:1 }}>
              <div style={{ width:34, height:34, border:"3px solid rgba(255,255,255,0.12)", borderTop:`3px solid ${accent}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
              <span style={{ color:"rgba(255,255,255,0.45)", fontSize:14 }}>Loading…</span>
            </div>
          )}

          {isImage && (
            <img src={url} alt={name} onLoad={() => setLoaded(true)}
              style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain", borderRadius:12, boxShadow:"0 20px 60px rgba(0,0,0,0.5)", opacity:loaded?1:0, transition:"opacity 0.3s" }} />
          )}
          {!isImage && !isVideo && !isAudio && googleViewerUrl && (
            <iframe src={googleViewerUrl} title={name} onLoad={() => setLoaded(true)}
              style={{ width:"100%", height:"100%", border:"none", opacity:loaded?1:0, transition:"opacity 0.3s" }} />
          )}
          {isVideo && (
            <video controls autoPlay onLoadedData={() => setLoaded(true)}
              style={{ maxWidth:"100%", maxHeight:"100%", borderRadius:12, opacity:loaded?1:0, transition:"opacity 0.3s" }}>
              <source src={url} />
            </video>
          )}
          {isAudio && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20, opacity:loaded?1:0 }}>
              <span style={{ fontSize:80 }}>🎵</span>
              <p style={{ color:"white", fontWeight:600, fontSize:18, margin:0 }}>{name}</p>
              <audio controls autoPlay onLoadedData={() => setLoaded(true)} style={{ width:320, marginTop:8 }}>
                <source src={url} />
              </audio>
            </div>
          )}
        </div>

        {/* ── Related sidebar ── */}
        {sidebarOpen && (related.length > 0 || relLoading) && (
          <div className="fv-sidebar" style={{ width:260, flexShrink:0, background:t.sidebar, borderLeft:`1px solid ${t.border}`, overflow:"hidden auto", display:"flex", flexDirection:"column", animation:"slideIn 0.22s ease both" }}>
            <div style={{ padding:"14px 14px 8px", borderBottom:`1px solid ${t.border}` }}>
              <p style={{ margin:0, fontSize:12, fontWeight:700, color:t.sub, letterSpacing:1, textTransform:"uppercase" }}>
                From this subject
              </p>
              <p style={{ margin:"3px 0 0", fontSize:13, fontWeight:600, color:t.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{subjectLabel}</p>
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:"8px" }}>
              {relLoading ? (
                <div style={{ display:"flex", justifyContent:"center", padding:"24px 0" }}>
                  <div style={{ width:24, height:24, border:`2px solid ${t.border}`, borderTop:`2px solid ${accent}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                </div>
              ) : related.map((r, i) => (
                <button key={r._id} className="rel-card"
                  onClick={() => setFile(r)}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 8px", borderRadius:10, background: r._id === file._id ? t.cardHov : "transparent", border:"none", cursor:"pointer", fontFamily:"inherit", transition:"background 0.15s", textAlign:"left", marginBottom:2 }}>
                  <FileThumbnail file={r} size={46} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:0, fontSize:12, fontWeight:600, color:t.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {r.title || r.fileName}
                    </p>
                    <div style={{ display:"flex", gap:8, marginTop:3 }}>
                      {r.type && <span style={{ fontSize:10, color:t.sub }}>{TYPE_ICONS[r.type]} {r.type}</span>}
                    </div>
                    <div style={{ display:"flex", gap:8, marginTop:2 }}>
                      {(r.downloads > 0) && (
                        <span style={{ fontSize:10, color:t.statClr, display:"flex", alignItems:"center", gap:2 }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          {r.downloads}
                        </span>
                      )}
                      {(r.likes?.length > 0) && (
                        <span style={{ fontSize:10, color:t.statClr }}>❤️ {r.likes.length}</span>
                      )}
                    </div>
                  </div>
                  {user && (
                    <button onClick={e => { e.stopPropagation(); handleRelatedDownload(r); }}
                      title="Download"
                      style={{ background:"none", border:"none", cursor:"pointer", color:t.sub, padding:"4px", borderRadius:6, flexShrink:0, display:"flex", alignItems:"center" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
