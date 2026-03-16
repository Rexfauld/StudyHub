import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import API from "../api";

const TABS = ["pending", "approved", "rejected"];
const TAB_LABELS = { pending: "Pending", approved: "Approved", rejected: "Rejected" };
const TAB_ICONS  = { pending: "⏳", approved: "✅", rejected: "❌" };

const TYPE_LABELS = { topic:"Topic/Simplified", book:"Book", questions:"Questions", photo:"Photo", other:"Other" };

function slugLabel(slug = "") {
  return slug.replace(/^(jhs|shs|uni)-/, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const accent      = { gold:"#e8b84b", blue:"#3b82f6", green:"#22c55e", rose:"#f43f5e" }[settings.accentColor] || "#e8b84b";
  const accentHover = { gold:"#c8980a", blue:"#1d4ed8", green:"#15803d", rose:"#be123c" }[settings.accentColor] || "#c8980a";
  const accentText  = { gold:"#1a1a2e", blue:"#fff",    green:"#fff",    rose:"#fff"    }[settings.accentColor] || "#1a1a2e";
  const isDark = settings.darkMode;
  const t = {
    bg:     isDark ? "#0f0f1e" : "#f7f7fa",
    card:   isDark ? "#1a1a2e" : "#ffffff",
    border: isDark ? "rgba(255,255,255,0.08)" : "#eee",
    text:   isDark ? "#f0f0f0" : "#1a1a2e",
    sub:    isDark ? "rgba(255,255,255,0.45)" : "#888",
    input:  isDark ? "#0f0f1e" : "#f7f7fa",
  };

  const [stats,       setStats]       = useState(null);
  const [uploads,     setUploads]     = useState([]);
  const [activeTab,   setActiveTab]   = useState("pending");
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(false);
  const [actionId,    setActionId]    = useState(null); // id being acted on
  const [rejectNote,  setRejectNote]  = useState("");
  const [rejectTarget,setRejectTarget]= useState(null);
  const [preview,     setPreview]     = useState(null);
  const [search,      setSearch]      = useState("");

  // Redirect non-admins
  useEffect(() => {
    if (user === null) navigate("/");
    if (user && user.role !== "admin") navigate("/");
  }, [user]);

  const fetchStats = useCallback(async () => {
    try { const r = await API.get("/admin/stats"); setStats(r.data); }
    catch {}
  }, []);

  const fetchUploads = useCallback(async () => {
    setLoading(true);
    try {
      const r = await API.get(`/admin/uploads?status=${activeTab}&page=${page}&limit=20`);
      setUploads(r.data.uploads || []);
      setTotalPages(r.data.pages || 1);
    } catch {}
    finally { setLoading(false); }
  }, [activeTab, page]);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { setPage(1); }, [activeTab]);
  useEffect(() => { fetchUploads(); }, [fetchUploads]);

  async function approve(id) {
    setActionId(id);
    try {
      await API.post(`/admin/approve/${id}`);
      setUploads(prev => prev.filter(u => u._id !== id));
      fetchStats();
    } catch {}
    finally { setActionId(null); }
  }

  async function reject(id, note) {
    setActionId(id);
    try {
      await API.post(`/admin/reject/${id}`, { note });
      setUploads(prev => prev.filter(u => u._id !== id));
      setRejectTarget(null); setRejectNote("");
      fetchStats();
    } catch {}
    finally { setActionId(null); }
  }

  async function deleteUpload(id) {
    if (!confirm("Permanently delete this file?")) return;
    setActionId(id);
    try {
      await API.delete(`/admin/uploads/${id}`);
      setUploads(prev => prev.filter(u => u._id !== id));
      fetchStats();
    } catch {}
    finally { setActionId(null); }
  }

  const filtered = uploads.filter(u =>
    !search || u.title?.toLowerCase().includes(search.toLowerCase()) ||
    u.uploader?.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.subjectSlug?.toLowerCase().includes(search.toLowerCase())
  );

  const css = `
    @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin { to{transform:rotate(360deg)} }
    .tab-active { background: linear-gradient(135deg,${accent},${accentHover}) !important; color:${accentText} !important; }
    .approve-btn:hover { background: #16a34a !important; }
    .reject-btn:hover  { background: #b91c1c !important; }
    .delete-btn:hover  { background: #991b1b !important; }
    .page-btn:hover    { background: ${accent} !important; color:${accentText} !important; }
    .upload-row { animation: fadeUp 0.3s ease both; }
    .upload-row:hover { background: ${isDark ? "rgba(255,255,255,0.03)" : "#fafafa"} !important; }
  `;

  if (user === undefined) return null;

  return (
    <div style={{ minHeight:"100vh", background:t.bg, color:t.text, paddingBottom:60 }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#0f0f1e,#1a1a2e)", padding:"24px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ display:"inline-block", background:`linear-gradient(135deg,${accent},${accentHover})`, color:accentText, fontWeight:"bold", fontSize:10, letterSpacing:2, padding:"2px 10px", borderRadius:4, marginBottom:8 }}>ADMIN</div>
          <h1 style={{ margin:0, color:"white", fontSize:26, fontWeight:700 }}>Dashboard</h1>
          <p style={{ margin:"4px 0 0", color:"rgba(255,255,255,0.45)", fontSize:13 }}>Manage uploads and users</p>
        </div>
        <button onClick={() => navigate("/")}
          style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:10, background:"rgba(255,255,255,0.1)", border:"1.5px solid rgba(255,255,255,0.15)", color:"white", fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
          ← Back to Site
        </button>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px 24px" }}>

        {/* Stats Cards */}
        {stats && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:14, marginBottom:28 }}>
            {[
              { label:"Pending",  value:stats.pending,  color:"#f59e0b", bg:"#fffbeb" },
              { label:"Approved", value:stats.approved, color:"#16a34a", bg:"#f0fdf4" },
              { label:"Rejected", value:stats.rejected, color:"#dc2626", bg:"#fef2f2" },
              { label:"Total Files", value:stats.total, color:accent,    bg:`${accent}18` },
              { label:"Users",    value:stats.users,    color:"#6366f1", bg:"#eef2ff" },
            ].map(s => (
              <div key={s.label} style={{ background:isDark ? t.card : s.bg, border:`1px solid ${isDark ? t.border : s.color+"33"}`, borderRadius:14, padding:"18px 20px", boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:13, color:t.sub, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs + Search */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:20 }}>
          <div style={{ display:"flex", gap:8, background:t.card, border:`1px solid ${t.border}`, borderRadius:12, padding:6 }}>
            {TABS.map(tab => (
              <button key={tab} className={activeTab === tab ? "tab-active" : ""}
                onClick={() => setActiveTab(tab)}
                style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:600, background:"transparent", color:t.sub, transition:"all 0.18s" }}>
                <span>{TAB_ICONS[tab]}</span>
                <span>{TAB_LABELS[tab]}</span>
                {stats && <span style={{ fontSize:12, background:activeTab===tab?"rgba(0,0,0,0.15)":"rgba(0,0,0,0.08)", padding:"1px 7px", borderRadius:10 }}>{stats[tab]}</span>}
              </button>
            ))}
          </div>
          <input placeholder="Search by title, user, subject…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding:"9px 14px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.input, color:t.text, fontSize:14, outline:"none", fontFamily:"inherit", width:260 }} />
        </div>

        {/* Uploads Table */}
        <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:16, overflow:"hidden", boxShadow:"0 2px 14px rgba(0,0,0,0.06)" }}>

          {/* Table header */}
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 140px", gap:12, padding:"12px 20px", background:isDark?"rgba(255,255,255,0.03)":"#f8f8fa", borderBottom:`1px solid ${t.border}`, fontSize:12, fontWeight:700, color:t.sub, textTransform:"uppercase", letterSpacing:0.5 }}>
            <span>File</span><span>Subject</span><span>Type</span><span>Uploaded</span><span>Actions</span>
          </div>

          {loading ? (
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", padding:"60px 0", gap:12 }}>
              <div style={{ width:28, height:28, border:`3px solid ${t.border}`, borderTop:`3px solid ${accent}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
              <span style={{ color:t.sub, fontSize:14 }}>Loading…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 0", gap:8 }}>
              <span style={{ fontSize:40 }}>📭</span>
              <p style={{ color:t.sub, fontSize:15, margin:0 }}>No {activeTab} uploads{search ? ` matching "${search}"` : ""}.</p>
            </div>
          ) : (
            filtered.map((upload, i) => {
              const isImg = upload.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)/i);
              const acting = actionId === upload._id;
              return (
                <div key={upload._id} className="upload-row"
                  style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 140px", gap:12, padding:"14px 20px", borderBottom:`1px solid ${t.border}`, alignItems:"center", animationDelay:`${i*30}ms`, transition:"background 0.15s" }}>

                  {/* File info */}
                  <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
                    <div style={{ width:44, height:44, borderRadius:10, overflow:"hidden", flexShrink:0, background:t.input, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
                      onClick={() => setPreview(upload)}>
                      {isImg
                        ? <img src={upload.fileUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={t.sub} strokeWidth="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                      }
                    </div>
                    <div style={{ minWidth:0 }}>
                      <p style={{ margin:0, fontWeight:600, color:t.text, fontSize:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{upload.title || upload.fileName}</p>
                      <p style={{ margin:"2px 0 0", fontSize:12, color:t.sub }}>{upload.uploader?.name || "Anonymous"} · {upload.uploader?.email || ""}</p>
                    </div>
                  </div>

                  {/* Subject */}
                  <span style={{ fontSize:13, color:t.sub, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{slugLabel(upload.subjectSlug)}</span>

                  {/* Type */}
                  <span style={{ fontSize:12, fontWeight:600, padding:"3px 10px", borderRadius:20, background:`${accent}22`, color:accent, width:"fit-content" }}>
                    {TYPE_LABELS[upload.type] || upload.type}
                  </span>

                  {/* Date */}
                  <span style={{ fontSize:12, color:t.sub }}>{new Date(upload.createdAt).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}</span>

                  {/* Actions */}
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {activeTab === "pending" && (<>
                      <button className="approve-btn" disabled={acting}
                        onClick={() => approve(upload._id)}
                        style={{ padding:"5px 12px", borderRadius:7, background:"#22c55e", color:"white", border:"none", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", opacity:acting?0.5:1 }}>
                        {acting ? "…" : "✓ Approve"}
                      </button>
                      <button className="reject-btn" disabled={acting}
                        onClick={() => setRejectTarget(upload)}
                        style={{ padding:"5px 12px", borderRadius:7, background:"#ef4444", color:"white", border:"none", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
                        ✕ Reject
                      </button>
                    </>)}
                    {activeTab === "approved" && (
                      <button className="reject-btn" disabled={acting}
                        onClick={() => setRejectTarget(upload)}
                        style={{ padding:"5px 12px", borderRadius:7, background:"#ef4444", color:"white", border:"none", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
                        Revoke
                      </button>
                    )}
                    <button className="delete-btn" disabled={acting}
                      onClick={() => deleteUpload(upload._id)}
                      style={{ padding:"5px 12px", borderRadius:7, background:"#7f1d1d", color:"white", border:"none", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
                      🗑 Delete
                    </button>
                    <a href={upload.fileUrl} target="_blank" rel="noreferrer"
                      style={{ padding:"5px 10px", borderRadius:7, background:t.input, color:t.text, border:`1px solid ${t.border}`, fontSize:12, fontWeight:600, textDecoration:"none", display:"flex", alignItems:"center" }}>
                      ↗
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:8, marginTop:20 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              style={{ padding:"8px 16px", borderRadius:8, border:`1px solid ${t.border}`, background:t.card, color:t.text, cursor:"pointer", fontFamily:"inherit", fontSize:14, opacity:page===1?0.4:1 }}>← Prev</button>
            {Array.from({ length:totalPages }, (_, i) => i+1).map(p => (
              <button key={p} className={p===page?"page-btn":""} onClick={() => setPage(p)}
                style={{ width:36, height:36, borderRadius:8, border:`1px solid ${p===page?accent:t.border}`, background:p===page?accent:t.card, color:p===page?accentText:t.text, cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:600, transition:"all 0.15s" }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
              style={{ padding:"8px 16px", borderRadius:8, border:`1px solid ${t.border}`, background:t.card, color:t.text, cursor:"pointer", fontFamily:"inherit", fontSize:14, opacity:page===totalPages?0.4:1 }}>Next →</button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectTarget && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:24 }}
          onClick={e => { if (e.target === e.currentTarget) { setRejectTarget(null); setRejectNote(""); } }}>
          <div style={{ background:t.card, borderRadius:20, padding:28, width:"100%", maxWidth:440, boxShadow:"0 24px 60px rgba(0,0,0,0.3)", animation:"fadeUp 0.25s ease both" }}>
            <h3 style={{ margin:"0 0 6px", color:t.text, fontSize:18, fontWeight:700 }}>
              {activeTab === "approved" ? "Revoke Approval" : "Reject Upload"}
            </h3>
            <p style={{ margin:"0 0 16px", color:t.sub, fontSize:13 }}>"{rejectTarget.title || rejectTarget.fileName}"</p>
            <label style={{ fontSize:13, fontWeight:600, color:t.sub, display:"block", marginBottom:8 }}>Reason (optional)</label>
            <textarea
              rows={3}
              placeholder="e.g. Incorrect subject, duplicate file, low quality…"
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.input, color:t.text, fontSize:14, fontFamily:"inherit", resize:"none", outline:"none", boxSizing:"border-box" }}
            />
            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              <button onClick={() => reject(rejectTarget._id, rejectNote)}
                style={{ flex:1, padding:"11px", borderRadius:10, background:"#ef4444", color:"white", border:"none", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                {activeTab === "approved" ? "Revoke" : "Reject"}
              </button>
              <button onClick={() => { setRejectTarget(null); setRejectNote(""); }}
                style={{ flex:1, padding:"11px", borderRadius:10, background:t.input, color:t.text, border:`1px solid ${t.border}`, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:24 }}
          onClick={e => { if (e.target === e.currentTarget) setPreview(null); }}>
          <div style={{ background:t.card, borderRadius:20, padding:24, width:"100%", maxWidth:560, boxShadow:"0 24px 60px rgba(0,0,0,0.4)", animation:"fadeUp 0.25s ease both" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h3 style={{ margin:0, color:t.text, fontSize:16, fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"80%" }}>{preview.title || preview.fileName}</h3>
              <button onClick={() => setPreview(null)} style={{ background:"none", border:"none", color:t.sub, fontSize:22, cursor:"pointer", lineHeight:1 }}>×</button>
            </div>
            {preview.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
              <img src={preview.fileUrl} alt={preview.title} style={{ width:"100%", borderRadius:12, maxHeight:400, objectFit:"contain", background:"#000" }} />
            ) : (
              <iframe src={preview.fileUrl} title={preview.title} style={{ width:"100%", height:400, borderRadius:12, border:"none" }} />
            )}
            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              {activeTab === "pending" && (
                <button onClick={() => { approve(preview._id); setPreview(null); }}
                  style={{ flex:1, padding:"10px", borderRadius:10, background:"#22c55e", color:"white", border:"none", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>✓ Approve</button>
              )}
              <a href={preview.fileUrl} target="_blank" rel="noreferrer"
                style={{ flex:1, padding:"10px", borderRadius:10, background:`linear-gradient(135deg,${accent},${accentHover})`, color:accentText, border:"none", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", textDecoration:"none", textAlign:"center" }}>↗ Open File</a>
              <button onClick={() => setPreview(null)}
                style={{ flex:1, padding:"10px", borderRadius:10, background:t.input, color:t.text, border:`1px solid ${t.border}`, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
