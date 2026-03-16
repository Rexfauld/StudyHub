import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import API from "../api";
import FileViewer from "../components/FileViewer";
import SignInModal from "../components/SignInModal";

// Parse a subjectSlug into readable level + subject parts
function parseSlug(slug = "") {
  const parts = slug.split("-");
  const prefix = parts[0].toLowerCase();

  const LEVELS = { jhs: "JHS", shs: "SHS", uni: "University" };
  const level = LEVELS[prefix] || null;
  const rest = level ? parts.slice(1) : parts;

  // For SHS slugs: shs-{course}-{subject} — second segment is often a course
  // For uni slugs: uni-{program}-year-{n}-{course}
  // For JHS slugs: jhs-{subject}
  // Best effort: just title-case and join the remainder
  const subject = rest
    .join(" ")
    .replace(/\b\w/g, c => c.toUpperCase());

  return { level, subject };
}

const LEVEL_OPTIONS = [
  { value: "",    label: "All Levels" },
  { value: "jhs", label: "JHS" },
  { value: "shs", label: "SHS" },
  { value: "uni", label: "University" },
];

const TYPE_OPTIONS = [
  { value: "",          label: "All Types" },
  { value: "topic",     label: "Notes / Topics" },
  { value: "book",      label: "Books" },
  { value: "questions", label: "Past Questions" },
  { value: "other",     label: "Other" },
];

const TYPE_ICONS  = { topic: "💡", book: "📚", questions: "❓", other: "📄" };
const LEVEL_COLORS = {
  JHS:        { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  SHS:        { bg: "#f0fdf4", text: "#16a34a", border: "#86efac" },
  University: { bg: "#faf5ff", text: "#7c3aed", border: "#d8b4fe" },
};

function FileIcon({ fileName }) {
  const f = (fileName || "").toLowerCase();
  if (/\.pdf$/.test(f))              return <span>📄</span>;
  if (/\.(jpg|jpeg|png|gif|webp)$/.test(f)) return <span>🖼️</span>;
  if (/\.(mp4|webm|ogg)$/.test(f))  return <span>🎬</span>;
  if (/\.(mp3|wav|m4a)$/.test(f))   return <span>🎵</span>;
  if (/\.(doc|docx)$/.test(f))      return <span>📝</span>;
  if (/\.(ppt|pptx)$/.test(f))      return <span>📊</span>;
  if (/\.(xls|xlsx)$/.test(f))      return <span>📈</span>;
  return <span>📁</span>;
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const q       = searchParams.get("q") || "";
  const { settings } = useSettings();
  const { user }     = useAuth();
  const toast        = useToast();

  const accent      = { gold:"#e8b84b", blue:"#3b82f6", green:"#22c55e", rose:"#f43f5e" }[settings.accentColor] || "#e8b84b";
  const accentHover = { gold:"#c8980a", blue:"#1d4ed8", green:"#15803d", rose:"#be123c" }[settings.accentColor] || "#c8980a";
  const accentText  = { gold:"#1a1a2e", blue:"#fff",    green:"#fff",    rose:"#fff"    }[settings.accentColor] || "#1a1a2e";
  const isDark = settings.darkMode;
  const t = {
    bg:     isDark ? "#0f0f1e" : "#f7f7fa",
    card:   isDark ? "#1a1a2e" : "#ffffff",
    text:   isDark ? "#f0f0f0" : "#1a1a2e",
    sub:    isDark ? "rgba(255,255,255,0.45)" : "#888",
    border: isDark ? "rgba(255,255,255,0.08)" : "#eee",
    input:  isDark ? "#1a1a2e" : "#fff",
    inputBorder: isDark ? "rgba(255,255,255,0.12)" : "#e5e5e5",
  };

  const [results,     setResults]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const [authModal,   setAuthModal]   = useState(false);
  const [levelFilter, setLevelFilter] = useState("");
  const [typeFilter,  setTypeFilter]  = useState("");
  const [sortBy,      setSortBy]      = useState("createdAt");
  const [detectedHints, setDetectedHints] = useState({ level: null, type: null });
  const [searchInput, setSearchInput] = useState(q);

  const doSearch = useCallback((query, level, type, sort) => {
    if (!query) return;
    setLoading(true);
    const params = new URLSearchParams({ q: query });
    if (level) params.set("level", level);
    if (type)  params.set("type", type);
    if (sort)  params.set("sort", sort);
    API.get(`/search?${params}`)
      .then(res => {
        setResults(res.data.results || []);
        setDetectedHints({ level: res.data.detectedLevel, type: res.data.detectedType });
        // Sync filters with what backend detected
        if (res.data.detectedLevel && !level) setLevelFilter(res.data.detectedLevel);
        if (res.data.detectedType  && !type)  setTypeFilter(res.data.detectedType);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSearchInput(q);
    setLevelFilter("");
    setTypeFilter("");
    doSearch(q, "", "", sortBy);
  }, [q]);

  // Re-run when filter/sort changes (after initial load)
  useEffect(() => {
    if (!q) return;
    doSearch(q, levelFilter, typeFilter, sortBy);
  }, [levelFilter, typeFilter, sortBy]);

  async function handleDownload(file) {
    if (!user) { setAuthModal(true); return; }
    try { await API.post(`/uploads/${file._id}/download`); } catch {}
    window.open(file.fileUrl, "_blank");
    setResults(prev => prev.map(f => f._id === file._id ? { ...f, downloads: (f.downloads || 0) + 1 } : f));
  }

  function handleNewSearch(e) {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchParams({ q: searchInput.trim() });
  }

  const css = `
    @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin   { to{transform:rotate(360deg)} }
    .result-card:hover { transform:translateY(-2px) !important; box-shadow:0 8px 24px rgba(0,0,0,0.11) !important; }
    .filter-btn:hover  { border-color:${accent} !important; color:${accent} !important; }
    .filter-btn.active { background:${accent} !important; color:${accentText} !important; border-color:${accent} !important; }
    .action-btn:hover  { opacity:0.85 !important; transform:translateY(-1px) !important; }
    .search-input:focus { border-color:${accent} !important; box-shadow:0 0 0 3px ${accent}22 !important; }
  `;

  return (
    <div style={{ minHeight:"100vh", background:t.bg, paddingBottom:60 }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#0f0f1e,#1a1a2e)", padding:"28px 32px 32px" }}>
        <form onSubmit={handleNewSearch} style={{ maxWidth:600, display:"flex", gap:10, marginBottom:20 }}>
          <input className="search-input"
            style={{ flex:1, padding:"11px 16px", borderRadius:12, border:"1.5px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.08)", color:"white", fontSize:15, fontFamily:"inherit", outline:"none", transition:"all 0.18s" }}
            placeholder="Search files, subjects…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)} />
          <button type="submit"
            style={{ padding:"11px 20px", borderRadius:12, background:accent, color:accentText, border:"none", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>
            Search
          </button>
        </form>

        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <p style={{ margin:0, color:"rgba(255,255,255,0.5)", fontSize:13, marginRight:4 }}>
            {loading ? "Searching…" : `${results.length} result${results.length !== 1 ? "s" : ""} for`}
            {!loading && <strong style={{ color:"white", marginLeft:6 }}>"{q}"</strong>}
          </p>
          {detectedHints.level && !loading && (
            <span style={{ padding:"2px 10px", borderRadius:50, background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.7)", fontSize:12 }}>
              📍 Searching in {detectedHints.level.toUpperCase()}
            </span>
          )}
          {detectedHints.type && !loading && (
            <span style={{ padding:"2px 10px", borderRadius:50, background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.7)", fontSize:12 }}>
              {TYPE_ICONS[detectedHints.type]} Filtered to {detectedHints.type}
            </span>
          )}
        </div>
      </div>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"24px 20px" }}>

        {/* Filters bar */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20, alignItems:"center" }}>
          {/* Level pills */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {LEVEL_OPTIONS.map(opt => (
              <button key={opt.value} className={`filter-btn${levelFilter === opt.value ? " active" : ""}`}
                style={{ padding:"6px 14px", borderRadius:50, border:"1.5px solid #ddd", background:"white", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", color:"#555" }}
                onClick={() => setLevelFilter(opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>

          <div style={{ width:1, height:24, background:"#ddd", flexShrink:0 }} />

          {/* Type pills */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {TYPE_OPTIONS.map(opt => (
              <button key={opt.value} className={`filter-btn${typeFilter === opt.value ? " active" : ""}`}
                style={{ padding:"6px 14px", borderRadius:50, border:"1.5px solid #ddd", background:"white", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", color:"#555" }}
                onClick={() => setTypeFilter(opt.value)}>
                {opt.value ? (TYPE_ICONS[opt.value] + " " + opt.label) : opt.label}
              </button>
            ))}
          </div>

          {/* Sort — pushed right */}
          <div style={{ marginLeft:"auto" }}>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ padding:"7px 12px", borderRadius:10, border:"1.5px solid #ddd", background:"white", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", outline:"none", color:"#555" }}>
              <option value="createdAt">Newest</option>
              <option value="downloads">Most Downloaded</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 0", gap:14 }}>
            <div style={{ width:36, height:36, border:"3px solid #eee", borderTop:`3px solid ${accent}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
            <p style={{ color:t.sub, fontSize:14, margin:0 }}>Searching…</p>
          </div>
        ) : results.length === 0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 0", gap:12, textAlign:"center" }}>
            <span style={{ fontSize:56 }}>🔍</span>
            <p style={{ fontSize:18, fontWeight:700, color:t.text, margin:0 }}>No results found</p>
            <p style={{ fontSize:14, color:t.sub, margin:0, maxWidth:320 }}>
              Try different keywords, or remove a filter.
            </p>
            {(levelFilter || typeFilter) && (
              <button onClick={() => { setLevelFilter(""); setTypeFilter(""); }}
                style={{ marginTop:8, padding:"8px 20px", borderRadius:50, background:accent, color:accentText, border:"none", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {results.map((f, i) => {
              const { level, subject } = parseSlug(f.subjectSlug);
              const lc = level ? LEVEL_COLORS[level] : null;
              return (
                <div key={f._id} className="result-card" style={{
                  background:t.card, borderRadius:16, padding:"16px 18px",
                  boxShadow:"0 2px 12px rgba(0,0,0,0.07)", border:`1px solid ${t.border}`,
                  display:"flex", alignItems:"center", gap:14,
                  animation:"fadeUp 0.3s ease both", animationDelay:`${i * 35}ms`,
                  transition:"all 0.18s"
                }}>
                  {/* Icon */}
                  <div style={{ width:44, height:44, borderRadius:12, background: isDark ? "#0f0f1e" : "#f3f3f8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                    <FileIcon fileName={f.fileName} />
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:0, fontWeight:700, color:t.text, fontSize:15, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {f.title || f.fileName}
                    </p>

                    {/* Subject breadcrumb */}
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:5, flexWrap:"wrap" }}>
                      {level && (
                        <span style={{ padding:"2px 9px", borderRadius:50, background: lc?.bg, color: lc?.text, border:`1px solid ${lc?.border}`, fontSize:11, fontWeight:700, flexShrink:0 }}>
                          {level}
                        </span>
                      )}
                      <span style={{ fontSize:13, color:t.sub, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {subject}
                      </span>
                      {f.type && (
                        <span style={{ fontSize:11, color:t.sub, background: isDark ? "#0f0f1e" : "#f3f3f8", padding:"2px 8px", borderRadius:50, flexShrink:0 }}>
                          {TYPE_ICONS[f.type]} {f.type}
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div style={{ display:"flex", gap:12, marginTop:4, flexWrap:"wrap" }}>
                      <span style={{ fontSize:11, color:t.sub }}>{f.uploader?.name || "Anonymous"}</span>
                      <span style={{ fontSize:11, color:t.sub }}>{new Date(f.createdAt).toLocaleDateString()}</span>
                      {(f.downloads > 0) && (
                        <span style={{ fontSize:11, color:t.sub, display:"flex", alignItems:"center", gap:3 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          {f.downloads}
                        </span>
                      )}
                      {(f.likes?.length > 0) && (
                        <span style={{ fontSize:11, color:t.sub }}>❤️ {f.likes.length}</span>
                      )}
                    </div>

                    {f.description && (
                      <p style={{ margin:"4px 0 0", fontSize:12, color:t.sub, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
                    <button className="action-btn" onClick={() => setViewingFile(f)}
                      style={{ padding:"8px 16px", borderRadius:8, background:"#1a1a2e", color:"white", border:"none", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", display:"flex", alignItems:"center", gap:5 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      View
                    </button>
                    <button className="action-btn" onClick={() => handleDownload(f)}
                      style={{ padding:"8px 16px", borderRadius:8, background:`linear-gradient(135deg,${accent},${accentHover})`, color:accentText, border:"none", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", display:"flex", alignItems:"center", gap:5 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      {user ? "Download" : "Sign in"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewingFile && <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />}
      <SignInModal open={authModal} onClose={() => setAuthModal(false)} />
    </div>
  );
}
