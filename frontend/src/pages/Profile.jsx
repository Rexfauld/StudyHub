import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { useToast } from "../context/ToastContext";
import API from "../api";
import FileViewer from "../components/FileViewer";

// ── helpers ──────────────────────────────────────────────────────────────────

function parseSlug(slug = "") {
  const parts  = slug.split("-");
  const prefix = parts[0].toLowerCase();
  const LEVELS  = { jhs: "JHS", shs: "SHS", uni: "University" };
  const level   = LEVELS[prefix] || null;
  const subject = (level ? parts.slice(1) : parts)
    .join(" ")
    .replace(/\b\w/g, c => c.toUpperCase());
  return { level, subject };
}

const LEVEL_COLORS = {
  JHS:        { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  SHS:        { bg: "#f0fdf4", text: "#16a34a", border: "#86efac" },
  University: { bg: "#faf5ff", text: "#7c3aed", border: "#d8b4fe" },
};

const STATUS_STYLES = {
  approved: { bg: "#f0fdf4", text: "#16a34a", border: "#86efac", icon: "✓", label: "Approved" },
  pending:  { bg: "#fffbeb", text: "#d97706", border: "#fcd34d", icon: "⏳", label: "Pending" },
  rejected: { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5", icon: "✕", label: "Rejected" },
};

const TYPE_ICONS = { topic: "💡", book: "📚", questions: "❓", other: "📄", photo: "🖼️" };

function FileIcon({ fileName }) {
  const f = (fileName || "").toLowerCase();
  if (/\.pdf$/i.test(f))                    return "📄";
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(f)) return "🖼️";
  if (/\.(doc|docx)$/i.test(f))             return "📝";
  if (/\.(ppt|pptx)$/i.test(f))             return "📊";
  if (/\.(xls|xlsx)$/i.test(f))             return "📈";
  return "📁";
}

const TABS = ["All", "Approved", "Pending", "Rejected"];

// ── component ─────────────────────────────────────────────────────────────────

export default function Profile() {
  const { user }     = useAuth();
  const { settings } = useSettings();
  const toast        = useToast();
  const navigate     = useNavigate();

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
    tag:    isDark ? "#0f0f1e" : "#f3f3f8",
  };

  const [uploads,     setUploads]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState("All");
  const [viewingFile, setViewingFile] = useState(null);
  const [editName,    setEditName]    = useState(false);
  const [nameInput,   setNameInput]   = useState("");
  const [savingName,  setSavingName]  = useState(false);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    setNameInput(user.name || "");
    API.get("/uploads/mine")
      .then(res => setUploads(res.data.uploads || []))
      .catch(() => toast.error("Failed to load your uploads."))
      .finally(() => setLoading(false));
  }, [user]);

  async function saveName() {
    if (!nameInput.trim()) return;
    setSavingName(true);
    try {
      await API.patch("/auth/profile", { name: nameInput.trim() });
      toast.success("Name updated!");
      setEditName(false);
      // Reflect in header by reloading user — simplest approach
      window.location.reload();
    } catch {
      toast.error("Failed to update name.");
    } finally {
      setSavingName(false);
    }
  }

  const filtered = uploads.filter(u => {
    if (activeTab === "All") return true;
    return u.status === activeTab.toLowerCase();
  });

  const counts = {
    All:      uploads.length,
    Approved: uploads.filter(u => u.status === "approved").length,
    Pending:  uploads.filter(u => u.status === "pending").length,
    Rejected: uploads.filter(u => u.status === "rejected").length,
  };

  const totalDownloads = uploads.reduce((s, u) => s + (u.downloads || 0), 0);
  const totalLikes     = uploads.reduce((s, u) => s + (u.likes?.length || 0), 0);

  const css = `
    @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin   { to{transform:rotate(360deg)} }
    .up-card:hover  { transform:translateY(-2px) !important; box-shadow:0 8px 24px rgba(0,0,0,0.1) !important; }
    .tab-btn:hover  { background:${isDark?"rgba(255,255,255,0.06)":"#f7f7fa"} !important; }
    .tab-btn.active { color:${accent} !important; border-bottom:2.5px solid ${accent} !important; }
    .edit-btn:hover { background:${accent}22 !important; color:${accent} !important; }
    .save-btn:hover { background:${accentHover} !important; }
    .view-btn:hover { opacity:0.85 !important; }
  `;

  if (!user) return null;

  // ── avatar initials ─────────────────────────────────────────────────────────
  const initials = (user.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const providerBadge = { google:"🌐", github:"🐙", email:"✉️" }[user.provider] || "👤";

  return (
    <div style={{ minHeight:"100vh", background:t.bg, paddingBottom:60 }}>
      <style>{css}</style>

      {/* ── Profile header ─────────────────────────────────────────────── */}
      <div style={{ background:"linear-gradient(135deg,#0f0f1e,#1a1a2e)", padding:"36px 32px 0" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>

          <div style={{ display:"flex", alignItems:"flex-start", gap:20, paddingBottom:28 }}>
            {/* Avatar */}
            <div style={{ width:72, height:72, borderRadius:20, background:`linear-gradient(135deg,${accent},${accentHover})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:800, color:accentText, flexShrink:0, boxShadow:"0 8px 24px rgba(0,0,0,0.3)" }}>
              {initials}
            </div>

            {/* Name + email */}
            <div style={{ flex:1, minWidth:0 }}>
              {editName ? (
                <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                  <input
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditName(false); }}
                    style={{ padding:"7px 12px", borderRadius:10, border:"1.5px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.1)", color:"white", fontSize:18, fontWeight:700, fontFamily:"inherit", outline:"none", width:240 }}
                    autoFocus />
                  <button className="save-btn" onClick={saveName} disabled={savingName}
                    style={{ padding:"7px 16px", borderRadius:10, background:accent, color:accentText, border:"none", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"background 0.15s" }}>
                    {savingName ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => setEditName(false)}
                    style={{ padding:"7px 12px", borderRadius:10, background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)", border:"none", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <h1 style={{ margin:0, color:"white", fontSize:22, fontWeight:800 }}>{user.name}</h1>
                  <button className="edit-btn" onClick={() => setEditName(true)}
                    style={{ padding:"4px 10px", borderRadius:8, background:"transparent", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.15)", fontSize:12, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
                    ✏️ Edit
                  </button>
                </div>
              )}
              <p style={{ margin:"6px 0 0", color:"rgba(255,255,255,0.45)", fontSize:13 }}>
                {providerBadge} {user.email}
                {user.role === "admin" && (
                  <span style={{ marginLeft:10, padding:"2px 9px", borderRadius:50, background: accent, color:accentText, fontSize:11, fontWeight:700 }}>Admin</span>
                )}
              </p>
            </div>

            {/* Stats */}
            <div style={{ display:"flex", gap:20, flexShrink:0 }}>
              {[
                { label:"Uploads",   value: uploads.length },
                { label:"Downloads", value: totalDownloads },
                { label:"Likes",     value: totalLikes },
              ].map(s => (
                <div key={s.label} style={{ textAlign:"center" }}>
                  <p style={{ margin:0, color:"white", fontSize:22, fontWeight:800 }}>{s.value}</p>
                  <p style={{ margin:0, color:"rgba(255,255,255,0.45)", fontSize:12 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:0, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
            {TABS.map(tab => (
              <button key={tab} className={`tab-btn${activeTab === tab ? " active" : ""}`}
                onClick={() => setActiveTab(tab)}
                style={{ padding:"14px 20px", background:"none", border:"none", borderBottom:"2.5px solid transparent", color: activeTab === tab ? accent : "rgba(255,255,255,0.45)", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", display:"flex", alignItems:"center", gap:7 }}>
                {tab}
                <span style={{ padding:"1px 7px", borderRadius:50, background:"rgba(255,255,255,0.08)", fontSize:11, color:"rgba(255,255,255,0.5)" }}>
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Uploads list ───────────────────────────────────────────────── */}
      <div style={{ maxWidth:860, margin:"28px auto", padding:"0 20px" }}>
        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 0", gap:14 }}>
            <div style={{ width:36, height:36, border:"3px solid #eee", borderTop:`3px solid ${accent}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
            <p style={{ color:t.sub, fontSize:14, margin:0 }}>Loading your uploads…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 0", gap:12, textAlign:"center" }}>
            <span style={{ fontSize:52 }}>{activeTab === "All" ? "📂" : activeTab === "Approved" ? "✅" : activeTab === "Pending" ? "⏳" : "❌"}</span>
            <p style={{ fontSize:17, fontWeight:700, color:t.text, margin:0 }}>
              {activeTab === "All" ? "No uploads yet" : `No ${activeTab.toLowerCase()} files`}
            </p>
            <p style={{ fontSize:13, color:t.sub, margin:0 }}>
              {activeTab === "All" ? "Start contributing by uploading study materials." : `You have no ${activeTab.toLowerCase()} submissions.`}
            </p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filtered.map((f, i) => {
              const { level, subject } = parseSlug(f.subjectSlug);
              const lc = level ? LEVEL_COLORS[level] : null;
              const sc = STATUS_STYLES[f.status] || STATUS_STYLES.pending;

              return (
                <div key={f._id} className="up-card" style={{
                  background:t.card, borderRadius:16, padding:"16px 18px",
                  border:`1px solid ${t.border}`,
                  boxShadow:"0 2px 10px rgba(0,0,0,0.06)",
                  display:"flex", alignItems:"flex-start", gap:14,
                  animation:"fadeUp 0.3s ease both", animationDelay:`${i*35}ms`,
                  transition:"all 0.18s"
                }}>
                  {/* Icon */}
                  <div style={{ width:46, height:46, borderRadius:13, background:t.tag, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                    {FileIcon({ fileName: f.fileName })}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                      <p style={{ margin:0, fontWeight:700, color:t.text, fontSize:15, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:360 }}>
                        {f.title || f.fileName}
                      </p>
                      {/* Status badge */}
                      <span style={{ padding:"2px 9px", borderRadius:50, background:sc.bg, color:sc.text, border:`1px solid ${sc.border}`, fontSize:11, fontWeight:700, flexShrink:0 }}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>

                    {/* Subject breadcrumb */}
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5, flexWrap:"wrap" }}>
                      {level && (
                        <span style={{ padding:"2px 8px", borderRadius:50, background:lc?.bg, color:lc?.text, border:`1px solid ${lc?.border}`, fontSize:11, fontWeight:700 }}>
                          {level}
                        </span>
                      )}
                      <span style={{ fontSize:13, color:t.sub }}>{subject}</span>
                      {f.type && (
                        <span style={{ fontSize:11, color:t.sub, background:t.tag, padding:"2px 7px", borderRadius:50 }}>
                          {TYPE_ICONS[f.type]} {f.type}
                        </span>
                      )}
                    </div>

                    {/* Rejection note */}
                    {f.status === "rejected" && f.adminNote && (
                      <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:8, padding:"7px 12px", marginBottom:6 }}>
                        <p style={{ margin:0, fontSize:12, color:"#dc2626", fontWeight:600 }}>
                          📋 Admin note: <span style={{ fontWeight:400 }}>{f.adminNote}</span>
                        </p>
                      </div>
                    )}

                    {/* Meta row */}
                    <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                      <span style={{ fontSize:11, color:t.sub }}>
                        Submitted {new Date(f.createdAt).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
                      </span>
                      {f.status === "approved" && f.approvedAt && (
                        <span style={{ fontSize:11, color:"#16a34a" }}>
                          ✓ Approved {new Date(f.approvedAt).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
                        </span>
                      )}
                      {(f.downloads > 0) && (
                        <span style={{ fontSize:11, color:t.sub, display:"flex", alignItems:"center", gap:3 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          {f.downloads} download{f.downloads !== 1 ? "s" : ""}
                        </span>
                      )}
                      {(f.likes?.length > 0) && (
                        <span style={{ fontSize:11, color:t.sub }}>
                          ❤️ {f.likes.length} like{f.likes.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions — only for approved files */}
                  {f.status === "approved" && (
                    <button className="view-btn" onClick={() => setViewingFile(f)}
                      style={{ padding:"8px 16px", borderRadius:8, background:"#1a1a2e", color:"white", border:"none", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", flexShrink:0, transition:"opacity 0.15s" }}>
                      👁 View
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewingFile && <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />}
    </div>
  );
}
