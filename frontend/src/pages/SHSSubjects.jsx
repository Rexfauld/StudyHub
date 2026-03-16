import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FileViewer from '../components/FileViewer';
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import SignInModal from "../components/SignInModal";
import UploadModal from "../components/UploadModal";
import { useToast } from "../context/ToastContext";
import FileCard from "../components/FileCard";
import API from "../api";

const COURSE_SUBJECTS = {
  "Computer Science":      ["Core Mathematics","English Language","Social Studies","Integrated Science","Elective Mathematics","Physics","Chemistry"],
  "General Science":       ["Core Mathematics","English Language","Social Studies","Integrated Science","Elective Mathematics","Physics","Chemistry","Biology"],
  "STEM":                  ["Core Mathematics","English Language","Social Studies","Integrated Science","Elective Mathematics","Physics","Chemistry"],
  "Agricultural Science":  ["Core Mathematics","English Language","Social Studies","Integrated Science","Animal Husbandry","Crop Husbandry","Biology","Chemistry"],
  "General Arts":          ["Core Mathematics","English Language","Social Studies","Integrated Science","History","Government","Literature","Economics"],
  "Visual Arts":           ["Core Mathematics","English Language","Social Studies","Integrated Science","Graphic Design","Ceramics","Sculpture","Picture Making"],
  "Home Economics":        ["Core Mathematics","English Language","Social Studies","Integrated Science","Food & Nutrition","Management in Living","Clothing & Textiles","Biology"],
  "Business":              ["Core Mathematics","English Language","Social Studies","Integrated Science","Business Management","Accounting","Economics","Elective Mathematics"],
};

const SECTIONS = ["Topic / Simplified", "Book", "Questions"];
const SECTION_ICONS = { "Topic / Simplified": "💡", Book: "📚", Questions: "❓" };
const SECTION_DESC  = {
  "Topic / Simplified": "Simplified notes and topic summaries",
  Book:      "Complete textbooks and references",
  Questions: "Past questions and practice tests",
};

const SUBJECT_ICONS = {
  "Core Mathematics":"📐","Elective Mathematics":"🧮","Further Mathematics":"📏",
  "English Language":"📖","Social Studies":"🌍","Integrated Science":"🔬",
  Physics:"⚛️",Chemistry:"🧪",Biology:"🧬",Economics:"💹",
  "Computer Science":"💻","History":"📜","Government":"🏛️","Literature":"📚",
  "Animal Husbandry":"🐄","Crop Husbandry":"🌾","Graphic Design":"🎨",
  Ceramics:"🏺",Sculpture:"🗿","Picture Making":"🖼️",
  "Food & Nutrition":"🍽️","Management in Living":"🏠",
  "Clothing & Textiles":"🧵","Business Management":"💼","Accounting":"🧾",
};

export default function SHSSubjects() {
  const { settings } = useSettings();
  const accent      = { gold:"#e8b84b", blue:"#3b82f6", green:"#22c55e", rose:"#f43f5e" }[settings.accentColor] || "#e8b84b";
  const accentHover = { gold:"#c8980a", blue:"#1d4ed8", green:"#15803d", rose:"#be123c" }[settings.accentColor] || "#c8980a";
  const accentText  = { gold:"#1a1a2e", blue:"#fff",    green:"#fff",    rose:"#fff"    }[settings.accentColor] || "#1a1a2e";
  const { course } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const isDark = settings.darkMode;
  const t = {
    bg:         isDark ? "#0f0f1e" : "#f7f7fa",
    card:       isDark ? "#1a1a2e" : "#ffffff",
    cardHov:    isDark ? "#232348" : "#f9f9ff",
    text:       isDark ? "#f0f0f0" : "#1a1a2e",
    sub:        isDark ? "rgba(255,255,255,0.4)" : "#999",
    border:     isDark ? "rgba(255,255,255,0.08)" : "#eee",
    iconBg:     isDark ? "#0f0f1e"  : "#f3f3f8",
    dropBg:     isDark ? "#1a1a2e" : "#ffffff",
    dropBorder: isDark ? "rgba(255,255,255,0.12)" : "#ddd",
    spinner:    isDark ? "rgba(255,255,255,0.1)" : "#eee",
  };
  const s = {
    page: { minHeight: "100vh", background: t.bg, paddingBottom: 60 },
    pageHeader: { background: "linear-gradient(135deg,#0f0f1e,#1a1a2e)", padding: "24px 24px" },
    headerLeft: { display: "flex", alignItems: "flex-start", gap: 14 },
    backBtn: { display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.85)", fontSize: 14, cursor: "pointer", borderRadius: 8, padding: "7px 14px", transition: "all 0.18s", fontFamily: "inherit", marginTop: 4, flexShrink: 0 },
    breadcrumb: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" },
    breadItem: { fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 },
    breadSep: { fontSize: 12, color: "rgba(255,255,255,0.25)" },
    pageTitle: { margin: 0, color: "white", fontSize: "clamp(18px,4vw,26px)", fontWeight: 700, letterSpacing: "-0.5px" },
    subtitle: { margin: "6px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 14 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 14, padding: "20px 20px", maxWidth: 960, margin: "0 auto" },
    card: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "24px 14px 18px", background: t.card, border: `2px solid ${t.border}`, borderRadius: 16, cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", animation: "fadeUp 0.4s ease both", transition: "all 0.18s", fontFamily: "inherit" },
    cardIcon: { fontSize: 32 },
    cardLabel: { fontSize: 13, fontWeight: 700, color: t.text, textAlign: "center", lineHeight: 1.3 },
    cardArrow: { fontSize: 13, color: t.sub },
    sectionWrapper: { maxWidth: 580, margin: "24px auto", padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 },
    sectionCard: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 18px", background: t.card, border: `2px solid ${t.border}`, borderRadius: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.06)", animation: "fadeUp 0.4s ease both", transition: "all 0.18s", fontFamily: "inherit" },
    sectionLeft: { display: "flex", alignItems: "center", gap: 14 },
    sectionIconWrap: { width: 42, height: 42, borderRadius: 12, background: t.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 },
    sectionLabel: { fontSize: 15, fontWeight: 700, color: t.text, textAlign: "left" },
    sectionDesc: { fontSize: 12, color: t.sub, marginTop: 2, textAlign: "left" },
    fileArea: { maxWidth: 760, margin: "24px auto", padding: "0 20px" },
    dropzone: { border: `2px dashed ${t.dropBorder}`, borderRadius: 16, padding: "36px 20px", textAlign: "center", cursor: "pointer", background: t.dropBg, transition: "all 0.2s", marginBottom: 20 },
    dropInner: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
    dropIconWrap: { width: 56, height: 56, borderRadius: 16, background: t.iconBg, display: "flex", alignItems: "center", justifyContent: "center" },
    dropText: { fontSize: 15, fontWeight: 600, color: t.text, margin: 0 },
    dropSub: { fontSize: 13, color: t.sub, margin: 0 },
    errorBox: { background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: 10, padding: "12px 16px", fontSize: 14, marginBottom: 16 },
    loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" },
    spinner: { width: 32, height: 32, border: `3px solid ${t.spinner}`, borderTop: `3px solid ${accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" },
    fileSection: { marginTop: 8 },
    fileListTitle: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: t.sub, marginBottom: 14 },
    fileGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(165px,1fr))", gap: 12 },
    emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", gap: 8 },
    emptyText: { fontSize: 16, fontWeight: 600, color: t.sub, margin: 0 },
    emptySub: { fontSize: 14, color: t.sub, margin: 0 },
  };

  const decodedCourse = decodeURIComponent(course);
  const subjects = COURSE_SUBJECTS[decodedCourse] || [];

  const [activeSubject, setActiveSubject] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [files, setFiles]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const [error, setError]     = useState("");

  async function handleLike(fileId) {
    if (!user) { setAuthModal(true); return; }
    try {
      const res = await API.post(`/uploads/${fileId}/like`);
      setFiles(prev => prev.map(f => f._id === fileId
        ? { ...f, likes: Array(res.data.likes).fill(null), _liked: res.data.liked }
        : f
      ));
    } catch {}
  }

  async function openSection(sec) {
    setActiveSection(sec);
    setLoading(true);
    setError("");
    try {
      const slug = `shs-${decodedCourse.toLowerCase().replace(/\s+/g,"-")}-${activeSubject.toLowerCase().replace(/\s+/g,"-")}`;
      const typeMap = { "Topic / Simplified": "topic", Book: "book", Questions: "questions" };
      const res = await API.get(`/uploads?subjectSlug=${slug}&type=${typeMap[sec]}&status=approved`);
      setFiles(res.data.uploads || []);
    } catch {
      setError("Failed to load files.");
    } finally {
      setLoading(false);
    }
  }

  function handleView(file) {
    setViewingFile(file);
  }

  async function handleDownload(file) {
    if (!user) { setAuthModal(true); return; }
    try { await API.post(`/uploads/${file._id}/download`); } catch {}
    window.open(file.fileUrl, '_blank');
    setFiles(prev => prev.map(f => f._id === file._id ? { ...f, downloads: (f.downloads || 0) + 1 } : f));
  }

  function goBack() {
    if (activeSection) { setActiveSection(null); setFiles([]); }
    else if (activeSubject) { setActiveSubject(null); }
    else navigate("/shs");
  }

  const pageTitle = activeSection ? activeSection : activeSubject ? activeSubject : decodedCourse;

  const css = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  .subject-card:hover { transform:translateY(-4px) !important; box-shadow:0 12px 30px rgba(0,0,0,0.12) !important; border-color:${accent} !important; }
  .section-card:hover { transform:translateY(-2px) !important; border-color:${accent} !important; box-shadow:0 8px 24px rgba(0,0,0,0.1) !important; }
  .dropzone:hover { border-color:${accent} !important; background:${isDark ? "#1e1e38" : "#fafafa"} !important; }
  .file-card:hover { transform:translateY(-3px) !important; box-shadow:0 8px 24px rgba(0,0,0,0.12) !important; }
  .dl-btn:hover { background:#0d3a6e !important; }
  .back-btn:hover { background:rgba(255,255,255,0.18) !important; }

  @media (max-width: 600px) {
    .shs-page-header { padding: 18px 14px !important; flex-direction: column !important; gap: 12px !important; }
    .shs-courses-grid { grid-template-columns: repeat(auto-fill,minmax(130px,1fr)) !important; padding: 14px !important; gap: 10px !important; }
    .shs-subject-grid { grid-template-columns: repeat(auto-fill,minmax(130px,1fr)) !important; padding: 14px !important; gap: 10px !important; }
    .shs-section-wrapper { padding: 0 12px !important; margin-top: 18px !important; }
    .shs-file-area { padding: 0 12px !important; margin-top: 18px !important; }
    .shs-file-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
    .shs-file-actions { flex-wrap: wrap !important; }
    .shs-like-btn { width: 100% !important; justify-content: center !important; }
    .shs-dropzone { padding: 22px 14px !important; }
    .shs-search-input { width: 100% !important; }
  }
`;
  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* PAGE HEADER */}
      <div style={s.pageHeader}>
        <div style={s.headerLeft}>
          <button className="back-btn" style={s.backBtn} onClick={goBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </button>
          <div>
            <div style={s.breadcrumb}>
              <span style={s.breadItem}>SHS</span>
              <span style={s.breadSep}>›</span>
              <span style={s.breadItem}>{decodedCourse}</span>
              {activeSubject && <><span style={s.breadSep}>›</span><span style={s.breadItem}>{activeSubject}</span></>}
              {activeSection && <><span style={s.breadSep}>›</span><span style={s.breadItem}>{activeSection}</span></>}
            </div>
            <h1 style={s.pageTitle}>{pageTitle}</h1>
            {!activeSubject && <p style={s.subtitle}>Select a subject to access study materials</p>}
            {activeSubject && !activeSection && <p style={s.subtitle}>Choose a section</p>}
          </div>
        </div>
      </div>

      {/* SUBJECTS GRID */}
      {!activeSubject && (
        <div style={s.grid}>
          {subjects.map((subject, i) => (
            <button
              key={subject}
              className="subject-card"
              style={{ ...s.card, animationDelay: `${i * 55}ms` }}
              onClick={() => { setActiveSubject(subject); setActiveSection(null); }}
            >
              <span style={s.cardIcon}>{SUBJECT_ICONS[subject] || "📄"}</span>
              <span style={{ ...s.cardLabel, color:t.text }}>{subject}</span>
              <span style={{ ...s.cardArrow, color:t.sub }}>→</span>
            </button>
          ))}
        </div>
      )}

      {/* SECTIONS */}
      {activeSubject && !activeSection && (
        <div style={s.sectionWrapper}>
          {SECTIONS.map((sec, i) => (
            <button
              key={sec}
              className="section-card"
              style={{ ...s.sectionCard, animationDelay: `${i * 80}ms` }}
              onClick={() => openSection(sec)}
            >
              <div style={s.sectionLeft}>
                <div style={s.sectionIconWrap}>{SECTION_ICONS[sec]}</div>
                <div>
                  <div style={s.sectionLabel}>{sec}</div>
                  <div style={s.sectionDesc}>{SECTION_DESC[sec]}</div>
                </div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          ))}
        </div>
      )}

      {/* FILE AREA */}
      {activeSubject && activeSection && (
        <div style={s.fileArea}>

          {/* Upload zone */}
          <div
            className="dropzone"
            style={s.dropzone}
            onClick={() => { if (!user) { setAuthModal(true); return; } setUploadModal(true); }}
          >
            <div style={s.dropInner}>
              <div style={s.dropIconWrap}>
                {user
                  ? <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                }
              </div>
              {user ? (
                <>
                  <p style={s.dropText}>Click to upload files or photos</p>
                  <p style={s.dropSub}>PDFs, images, documents — any format</p>
                </>
              ) : (
                <>
                  <p style={s.dropText}>Sign in to upload files</p>
                  <p style={s.dropSub}>You can view files below without signing in</p>
                </>
              )}
            </div>
          </div>

          {error && <div style={s.errorBox}>{error}</div>}

          {/* Files */}
          {loading ? (
            <div style={s.loadingWrap}>
              <div style={s.spinner} />
              <p style={{ color: "#aaa", marginTop: 12 }}>Loading files…</p>
            </div>
          ) : files.length > 0 ? (
            <div style={s.fileSection}>
              <h3 style={s.fileListTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                {files.length} file{files.length > 1 ? "s" : ""}
              </h3>
              <div style={s.fileGrid}>
                {files.map((f, i) => (
                  <FileCard key={f._id || i} file={f} index={i}
                    accent={accent} accentText={accentText} isDark={isDark}
                    user={user}
                    onView={handleView}
                    onDownload={handleDownload}
                    onLike={handleLike}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div style={s.emptyState}>
              <span style={{ fontSize: 40 }}>📂</span>
              <p style={s.emptyText}>No files yet in this section.</p>
              <p style={s.emptySub}>Be the first to upload!</p>
            </div>
          )}
        </div>
      )}

      <SignInModal open={authModal} onClose={() => setAuthModal(false)} />
      {viewingFile && <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />}
      <UploadModal
        open={uploadModal}
        onClose={(success) => {
          setUploadModal(false);
          if (success) toast.success("Upload submitted — pending admin approval.");
        }}
        subjectSlug={`shs-${decodedCourse.toLowerCase().replace(/\s+/g,"-")}-${activeSubject?.toLowerCase().replace(/\s+/g,"-")}`}
        defaultType={{ "Topic / Simplified":"topic", Book:"book", Questions:"questions" }[activeSection] || "topic"}
      />
    </div>
  );
}



