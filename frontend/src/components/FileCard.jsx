/**
 * Reusable file card used on JHS, SHSSubjects, Courses.
 * Props: file, accent, accentText, isDark, onView, onDownload, onLike, user
 */
import { useState } from "react";

const TYPE_LABEL = { topic:"Topic", book:"Book", questions:"Past Q", other:"Other", photo:"Photo" };

function Thumbnail({ file }) {
  const [imgErr, setImgErr] = useState(false);
  const url  = file.fileUrl || "";
  const name = (file.fileName || "").toLowerCase();
  const isImg = (/\.(jpg|jpeg|png|gif|webp)$/i.test(name) || /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)) && !imgErr;

  const icon = (() => {
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(name)) return "🖼️";
    if (/\.pdf$/i.test(name))  return "📄";
    if (/\.(doc|docx)$/i.test(name)) return "📝";
    if (/\.(ppt|pptx)$/i.test(name)) return "📊";
    if (/\.(mp4|webm)$/i.test(name)) return "🎬";
    if (/\.(mp3|wav|m4a)$/i.test(name)) return "🎵";
    return "📁";
  })();

  return (
    <div style={{ height:100, overflow:"hidden", background:"#f0f0f6" }}>
      {isImg
        ? <img src={url} alt={file.title} onError={() => setImgErr(true)}
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        : <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#f0f0f8,#e8e8f2)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
            <span style={{ fontSize:30 }}>{icon}</span>
            {file.type && <span style={{ fontSize:10, color:"#aaa", fontWeight:600, letterSpacing:0.5, textTransform:"uppercase" }}>{TYPE_LABEL[file.type] || file.type}</span>}
          </div>
      }
    </div>
  );
}

export default function FileCard({ file, accent, accentText, isDark, onView, onDownload, onLike, user, index = 0 }) {
  const t = {
    card:     isDark ? "#1a1a2e" : "#ffffff",
    text:     isDark ? "#f0f0f0" : "#1a1a2e",
    sub:      isDark ? "rgba(255,255,255,0.4)" : "#aaa",
    stat:     isDark ? "rgba(255,255,255,0.25)" : "#bbb",
    likeOff:  isDark ? "rgba(255,255,255,0.15)" : "#eee",
    viewBg:   isDark ? "#2a2a45" : "#1a1a2e",
    thumbBg:  isDark ? "#12122b" : "#f0f0f6",
  };

  return (
    <div className="sh-file-card" style={{ background:t.card, borderRadius:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.08)", border:`1px solid ${isDark?"rgba(255,255,255,0.07)":"#eee"}`, animation:"fadeUp 0.35s ease both", transition:"transform 0.18s,box-shadow 0.18s", animationDelay:`${index*40}ms` }}>
      {/* Thumbnail */}
      <div style={{ height:100, overflow:"hidden", background:t.thumbBg }}>
        <ThumbnailInner file={file} isDark={isDark} />
      </div>

      {/* Title + meta */}
      <div style={{ padding:"8px 10px 4px" }}>
        <p style={{ fontSize:12, fontWeight:700, color:t.text, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={file.title}>{file.title || file.fileName}</p>
        <p style={{ fontSize:11, color:t.sub, margin:"3px 0 0" }}>{file.uploader?.name || "Anonymous"} · {new Date(file.createdAt).toLocaleDateString()}</p>
      </div>

      {/* Stats */}
      <div style={{ padding:"0 10px 4px", display:"flex", gap:10 }}>
        <span style={{ fontSize:11, color:t.stat, display:"flex", alignItems:"center", gap:3 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          {file.downloads || 0}
        </span>
        <span style={{ fontSize:11, color:t.stat, display:"flex", alignItems:"center", gap:3 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          {file.likes?.length || 0}
        </span>
      </div>

      {/* Actions */}
      <div className="sh-file-buttons" style={{ padding:"0 10px 10px", display:"flex", gap:6, flexWrap:"wrap" }}>
        <button style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, flex:1, padding:"7px 6px", borderRadius:8, background:t.viewBg, color:"white", border:"none", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"opacity 0.18s" }}
          onClick={() => onView(file)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View
        </button>
        <button style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, flex:1, padding:"7px 6px", borderRadius:8, background:accent, color:accentText, border:"none", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"opacity 0.18s" }}
          onClick={() => onDownload(file)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          {user ? "Download" : "Sign in"}
        </button>
        <button style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4, padding:"7px 8px", borderRadius:8, background: file._liked ? "#fef2f2" : "transparent", color: file._liked ? "#e11d48" : t.stat, border:`1.5px solid ${file._liked ? "#fca5a5" : t.likeOff}`, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", flexShrink:0 }}
          onClick={() => onLike(file._id)}>
          {file._liked ? "❤️" : "🤍"}
        </button>
      </div>
    </div>
  );
}

// Internal thumbnail that handles dark/light bg
function ThumbnailInner({ file, isDark }) {
  const [imgErr, setImgErr] = useState(false);
  const url  = file.fileUrl || "";
  const name = (file.fileName || "").toLowerCase();
  const isImg = (/\.(jpg|jpeg|png|gif|webp)$/i.test(name) || /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)) && !imgErr;

  const icon = (() => {
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(name)) return "🖼️";
    if (/\.pdf$/i.test(name))  return "📄";
    if (/\.(doc|docx)$/i.test(name)) return "📝";
    if (/\.(ppt|pptx)$/i.test(name)) return "📊";
    if (/\.(mp4|webm)$/i.test(name)) return "🎬";
    if (/\.(mp3|wav|m4a)$/i.test(name)) return "🎵";
    return "📁";
  })();

  const bg = isDark
    ? "linear-gradient(135deg,#1e1e38,#16162c)"
    : "linear-gradient(135deg,#f0f0f8,#e8e8f2)";

  return isImg
    ? <img src={url} alt={file.title} onError={() => setImgErr(true)}
        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
    : <div style={{ width:"100%", height:"100%", background:bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:5 }}>
        <span style={{ fontSize:28 }}>{icon}</span>
        {file.type && <span style={{ fontSize:10, color: isDark ? "rgba(255,255,255,0.3)" : "#bbb", fontWeight:600, letterSpacing:0.5, textTransform:"uppercase" }}>{TYPE_LABEL[file.type] || file.type}</span>}
      </div>;
}
