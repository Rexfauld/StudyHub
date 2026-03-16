import { useState, useRef, useEffect } from "react";
import FileViewer from '../components/FileViewer';
import { useSettings } from "../context/SettingsContext";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SignInModal from "../components/SignInModal";
import UploadModal from "../components/UploadModal";
import { useToast } from "../context/ToastContext";
import FileCard from "../components/FileCard";
import API from "../api";

const SECTIONS = ["Topic / Simplified", "Book", "Questions"];
const SECTION_ICONS = { "Topic / Simplified": "💡", Book: "📚", Questions: "❓" };
const SECTION_DESC = {
  "Topic / Simplified": "Simplified notes and topic summaries",
  Book: "Complete textbooks and references",
  Questions: "Past questions and practice tests",
};

function getYears(prog) {
  const l = prog.toLowerCase();
  if (l.includes("phd") || l.includes("doctor")) return ["Year 1", "Year 2", "Year 3", "Year 4"];
  if (l.includes("diploma")) return ["Year 1", "Year 2"];
  if (l.includes("hnd") || l.includes("higher national")) return ["Year 1", "Year 2", "Year 3"];
  return ["Year 1", "Year 2", "Year 3", "Year 4"];
}

function makeSlug(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function Courses() {
  const { settings } = useSettings();
  const accent = { gold:"#e8b84b", blue:"#3b82f6", green:"#22c55e", rose:"#f43f5e" }[settings.accentColor] || "#e8b84b";
  const accentHover = { gold:"#c8980a", blue:"#1d4ed8", green:"#15803d", rose:"#be123c" }[settings.accentColor] || "#c8980a";
  const accentText = { gold:"#1a1a2e", blue:"#fff", green:"#fff", rose:"#fff" }[settings.accentColor] || "#1a1a2e";
  const isDark = settings.darkMode;
  const t = {
    bg:         isDark ? "#0f0f1e" : "#f7f7fa",
    card:       isDark ? "#1a1a2e" : "#ffffff",
    text:       isDark ? "#f0f0f0" : "#1a1a2e",
    sub:        isDark ? "rgba(255,255,255,0.4)" : "#999",
    border:     isDark ? "rgba(255,255,255,0.08)" : "#eee",
    iconBg:     isDark ? "#0f0f1e"  : "#f3f3f8",
    dropBg:     isDark ? "#1a1a2e" : "#ffffff",
    dropBorder: isDark ? "rgba(255,255,255,0.12)" : "#ddd",
    spinner:    isDark ? "rgba(255,255,255,0.1)" : "#eee",
    inputBg:    isDark ? "#0f0f1e" : "#fff",
    cancelBg:   isDark ? "#1e1e38" : "#f5f5f7",
    cancelText: isDark ? "rgba(255,255,255,0.5)" : "#666",
    ghostBorder:isDark ? "rgba(255,255,255,0.15)" : "#ddd",
  };
  const { program } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const decodedProgram = decodeURIComponent(program);
  const years = getYears(decodedProgram);

  // Navigation state
  const [activeYear,    setActiveYear]    = useState(null);
  const [activeCourse,  setActiveCourse]  = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  // Course management
  const [courses,      setCourses]      = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [addingCourse, setAddingCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [savingCourse, setSavingCourse] = useState(false);

  // File management
  const [files,      setFiles]      = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadModal, setUploadModal] = useState(false);
  const [authModal,  setAuthModal]  = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const [error,      setError]      = useState("");
  const fileInputRef = useRef();

  // Fetch courses when year is selected
  useEffect(() => {
    if (!activeYear) return;
    const slug = `uni-${makeSlug(decodedProgram)}-${makeSlug(activeYear)}`;
    setLoadingCourses(true);
    API.get(`/courses?programSlug=${slug}`)
      .then(res => setCourses(res.data.courses || []))
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));
  }, [activeYear, decodedProgram]);

  // Fetch files when section is selected
  useEffect(() => {
    if (!activeCourse || !activeSection) return;
    const typeMap = { "Topic / Simplified": "topic", Book: "book", Questions: "questions" };
    const slug = `uni-${makeSlug(decodedProgram)}-${makeSlug(activeYear)}-${makeSlug(activeCourse.name)}`;
    setLoadingFiles(true);
    setError("");
    API.get(`/uploads?subjectSlug=${slug}&type=${typeMap[activeSection]}&status=approved`)
      .then(res => setFiles(res.data.uploads || []))
      .catch(() => setError("Failed to load files."))
      .finally(() => setLoadingFiles(false));
  }, [activeCourse, activeSection]);

  async function saveCourse() {
    if (!newCourseName.trim()) return;
    setSavingCourse(true);
    const slug = `uni-${makeSlug(decodedProgram)}-${makeSlug(activeYear)}`;
    try {
      const res = await API.post("/courses", { name: newCourseName.trim(), programSlug: slug });
      setCourses(prev => [...prev, res.data.course]);
      setNewCourseName("");
      setAddingCourse(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add course.");
    } finally {
      setSavingCourse(false);
    }
  }

  function handleDownload(file) {
    if (!user) { setAuthModal(true); return; }
    try { API.post(`/uploads/${file._id}/download`); } catch {}
    window.open(file.fileUrl, '_blank');
    setFiles(prev => prev.map(f => f._id === file._id ? { ...f, downloads: (f.downloads || 0) + 1 } : f));
  }

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

  function goBack() {
    if (activeSection) { setActiveSection(null); setFiles([]); }
    else if (activeCourse) { setActiveCourse(null); }
    else if (activeYear) { setActiveYear(null); setCourses([]); }
    else navigate(-1);
  }

  const pageTitle = activeSection ? activeSection
    : activeCourse ? activeCourse.name
    : activeYear   ? activeYear
    : decodedProgram;

  const s = {
    page: { minHeight: "100vh", background: t.bg, paddingBottom: 60 },
    pageHeader: { background: "linear-gradient(135deg,#0f0f1e,#1a1a2e)", padding: "24px 32px", display: "flex", alignItems: "flex-start", gap: 14 },
    backBtn: { display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.85)", fontSize: 14, cursor: "pointer", borderRadius: 8, padding: "7px 14px", transition: "all 0.18s", fontFamily: "inherit", marginTop: 4, flexShrink: 0 },
    breadcrumb: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" },
    breadItem: { fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 },
    breadSep: { fontSize: 12, color: "rgba(255,255,255,0.25)" },
    pageTitle: { margin: 0, color: "white", fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px" },
    subtitle: { margin: "5px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 14 },
    yearGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, padding: "36px 32px", maxWidth: 900, margin: "0 auto" },
    yearCard: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "36px 20px", border: "2px solid transparent", borderRadius: 18, cursor: "pointer", animation: "fadeUp 0.4s ease both", transition: "all 0.18s", fontFamily: "inherit" },
    yearCircle: { width: 52, height: 52, borderRadius: "50%", background: "#1a1a2e", color: "white", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },
    yearLabel: { fontSize: 17, fontWeight: 700, color: "#1a1a2e" },
    yearSub: { fontSize: 12, color: "rgba(26,26,46,0.55)" },
    courseArea: { maxWidth: 820, margin: "32px auto", padding: "0 24px" },
    courseHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
    courseTitle: { fontSize: 18, fontWeight: 700, color: t.text, margin: 0 },
    addBtn: { display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 50, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(232,184,75,0.3)", transition: "all 0.18s" },
    addBtnGhost: { display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 50, background: "transparent", color: t.sub, border: `1.5px dashed ${t.ghostBorder}`, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" },
    addCourseBox: { background: t.card, borderRadius: 14, padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: 20, animation: "fadeUp 0.25s ease both", border: `1px solid ${t.border}` },
    courseInput: { width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 12, color: t.text, background: t.inputBg },
    addCourseActions: { display: "flex", gap: 10 },
    saveBtn: { padding: "9px 22px", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" },
    cancelBtn: { padding: "9px 18px", borderRadius: 8, background: t.cancelBg, color: t.cancelText, border: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
    courseGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 },
    courseCard: { display: "flex", alignItems: "center", gap: 12, padding: "18px 20px", background: t.card, border: `2px solid ${t.border}`, borderRadius: 12, cursor: "pointer", boxShadow: "0 3px 12px rgba(0,0,0,0.06)", animation: "fadeUp 0.35s ease both", transition: "all 0.18s", fontFamily: "inherit" },
    courseCardIcon: { fontSize: 22, flexShrink: 0 },
    courseCardLabel: { fontSize: 14, fontWeight: 600, color: t.text, textAlign: "left", lineHeight: 1.4, flex: 1 },
    courseCardArrow: { fontSize: 14, color: t.sub, flexShrink: 0 },
    sectionWrapper: { maxWidth: 620, margin: "32px auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 14 },
    sectionHint: { color: t.sub, fontSize: 14, marginBottom: 6 },
    sectionCard: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 22px", background: t.card, border: `2px solid ${t.border}`, borderRadius: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.06)", animation: "fadeUp 0.4s ease both", transition: "all 0.18s", fontFamily: "inherit" },
    sectionLeft: { display: "flex", alignItems: "center", gap: 14 },
    sectionIconWrap: { width: 44, height: 44, borderRadius: 12, background: t.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 },
    sectionLabel: { fontSize: 16, fontWeight: 700, color: t.text, textAlign: "left" },
    sectionDesc: { fontSize: 13, color: t.sub, marginTop: 2 },
    fileArea: { maxWidth: 780, margin: "28px auto", padding: "0 24px" },
    dropzone: { border: `2px dashed ${t.dropBorder}`, borderRadius: 16, padding: "40px 24px", textAlign: "center", cursor: "pointer", background: t.dropBg, transition: "all 0.2s", marginBottom: 24 },
    dropInner: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
    dropIconWrap: { width: 60, height: 60, borderRadius: 16, background: t.iconBg, display: "flex", alignItems: "center", justifyContent: "center" },
    dropText: { fontSize: 16, fontWeight: 600, color: t.text, margin: 0 },
    dropSub: { fontSize: 13, color: t.sub, margin: 0 },
    errorBox: { background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: 10, padding: "12px 16px", fontSize: 14, marginBottom: 16 },
    loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" },
    spinner: { width: 32, height: 32, border: `3px solid ${t.spinner}`, borderTop: `3px solid ${accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" },
    fileSection: { marginTop: 8 },
    fileListTitle: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: t.sub, marginBottom: 16 },
    fileGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 },
    emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", gap: 8 },
    emptyText: { fontSize: 16, fontWeight: 600, color: t.sub, margin: 0 },
    emptySub: { fontSize: 14, color: t.sub, margin: 0 },
  };

  const css = `
    @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin { to{transform:rotate(360deg)} }
    .year-card:hover { transform:translateY(-5px) !important; box-shadow:0 16px 36px rgba(0,0,0,0.15) !important; border-color:${accentHover} !important; }
    .course-card:hover { transform:translateY(-3px) !important; box-shadow:0 8px 22px rgba(0,0,0,0.1) !important; border-color:${accent} !important; }
    .section-card:hover { transform:translateY(-2px) !important; border-color:${accent} !important; box-shadow:0 8px 24px rgba(0,0,0,0.1) !important; }
    .dropzone:hover { border-color:${accent} !important; background:${isDark ? "#1e1e38" : "#fafafa"} !important; }
    .file-card:hover { transform:translateY(-3px) !important; box-shadow:0 8px 24px rgba(0,0,0,0.12) !important; }
    .dl-btn:hover { background:#0d3a6e !important; }
    .back-btn:hover { background:rgba(255,255,255,0.18) !important; }
    .add-btn:hover { transform:translateY(-2px); }

    @media (max-width: 600px) {
      .courses-page-header { padding: 18px 14px !important; }
      .courses-year-grid { grid-template-columns: 1fr 1fr !important; padding: 14px !important; gap: 10px !important; }
      .courses-grid { grid-template-columns: 1fr !important; padding: 14px !important; gap: 10px !important; }
      .courses-section-wrapper { padding: 0 12px !important; margin-top: 18px !important; }
      .courses-file-area { padding: 0 12px !important; margin-top: 18px !important; }
      .courses-file-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
      .courses-file-actions { flex-wrap: wrap !important; }
      .courses-like-btn { width: 100% !important; justify-content: center !important; }
      .courses-dropzone { padding: 22px 14px !important; }
    }
  `;

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={s.pageHeader}>
        <button className="back-btn" style={s.backBtn} onClick={goBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={s.breadcrumb}>
            <span style={s.breadItem}>{decodedProgram}</span>
            {activeYear    && <><span style={s.breadSep}>›</span><span style={s.breadItem}>{activeYear}</span></>}
            {activeCourse  && <><span style={s.breadSep}>›</span><span style={s.breadItem}>{activeCourse.name}</span></>}
            {activeSection && <><span style={s.breadSep}>›</span><span style={s.breadItem}>{activeSection}</span></>}
          </div>
          <h1 style={s.pageTitle}>{pageTitle}</h1>
          <p style={s.subtitle}>
            {!activeYear    && "Select a year"}
            {activeYear && !activeCourse  && "Select a course"}
            {activeCourse && !activeSection && "Select a section"}
            {activeSection && "View or upload materials"}
          </p>
        </div>
      </div>

      {/* YEAR BUTTONS */}
      {!activeYear && (
        <div style={s.yearGrid}>
          {years.map((year, i) => (
            <button key={year} className="year-card" style={{ ...s.yearCard, background:`linear-gradient(135deg,${accent},${accentHover})`, animationDelay:`${i*70}ms` }}
              onClick={() => setActiveYear(year)}>
              <div style={s.yearCircle}>{i + 1}</div>
              <div style={s.yearLabel}>{year}</div>
              <div style={s.yearSub}>View courses →</div>
            </button>
          ))}
        </div>
      )}

      {/* COURSES LIST */}
      {activeYear && !activeCourse && (
        <div style={s.courseArea}>
          {/* Add course button — signed in only */}
          <div style={s.courseHeader}>
            <h2 style={s.courseTitle}>Courses — {activeYear}</h2>
            {user ? (
              <button className="add-btn" style={{ ...s.addBtn, background:`linear-gradient(135deg,${accent},${accentHover})`, color:accentText }} onClick={() => setAddingCourse(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Course
              </button>
            ) : (
              <button className="add-btn-ghost" style={s.addBtnGhost} onClick={() => setAuthModal(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Sign in to add courses
              </button>
            )}
          </div>

          {/* Add course input */}
          {addingCourse && (
            <div style={s.addCourseBox} className="add-course-box">
              <input
                autoFocus
                style={{ ...s.courseInput, border:`1.5px solid ${accent}` }}
                placeholder="e.g. Introduction to Programming"
                value={newCourseName}
                onChange={e => setNewCourseName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveCourse(); if (e.key === "Escape") setAddingCourse(false); }}
              />
              <div style={s.addCourseActions}>
                <button style={{ ...s.saveBtn, background:`linear-gradient(135deg,${accent},${accentHover})`, color:accentText }} onClick={saveCourse} disabled={savingCourse || !newCourseName.trim()}>
                  {savingCourse ? "Saving…" : "Save Course"}
                </button>
                <button style={s.cancelBtn} onClick={() => { setAddingCourse(false); setNewCourseName(""); }}>Cancel</button>
              </div>
            </div>
          )}

          {error && <div style={s.errorBox}>{error}</div>}

          {loadingCourses ? (
            <div style={s.loadingWrap}><div style={s.spinner} /></div>
          ) : courses.length > 0 ? (
            <div style={s.courseGrid}>
              {courses.map((course, i) => (
                <button key={course._id} className="course-card" style={{ ...s.courseCard, animationDelay: `${i * 50}ms` }}
                  onClick={() => setActiveCourse(course)}>
                  <div style={s.courseCardIcon}>📘</div>
                  <span style={s.courseCardLabel}>{course.name}</span>
                  <span style={s.courseCardArrow}>→</span>
                </button>
              ))}
            </div>
          ) : (
            <div style={s.emptyState}>
              <span style={{ fontSize: 44 }}>📋</span>
              <p style={s.emptyText}>No courses added yet for {activeYear}.</p>
              <p style={s.emptySub}>{user ? "Click \"Add Course\" to get started." : "Sign in to add the first course."}</p>
            </div>
          )}
        </div>
      )}

      {/* SECTIONS (Topic / Book / Questions) */}
      {activeCourse && !activeSection && (
        <div style={s.sectionWrapper}>
          <p style={s.sectionHint}>Select a section under <strong>{activeCourse.name}</strong></p>
          {SECTIONS.map((sec, i) => (
            <button key={sec} className="section-card" style={{ ...s.sectionCard, animationDelay: `${i * 80}ms` }}
              onClick={() => setActiveSection(sec)}>
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
      {activeCourse && activeSection && (
        <div style={s.fileArea}>
          <div className="dropzone" style={s.dropzone}
            onClick={() => { if (!user) { setAuthModal(true); return; } setUploadModal(true); }}>
            <div style={s.dropInner}>
              <div style={s.dropIconWrap}>
                {user
                  ? <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                }
              </div>
              {user ? (
                <><p style={s.dropText}>Click to upload files or photos</p><p style={s.dropSub}>PDFs, images, documents — any format</p></>
              ) : (
                <><p style={s.dropText}>Sign in to upload files</p><p style={s.dropSub}>You can view files below without signing in</p></>
              )}
            </div>
          </div>

          {error && <div style={s.errorBox}>{error}</div>}

          {loadingFiles ? (
            <div style={s.loadingWrap}><div style={s.spinner} /><p style={{ color: "#aaa", marginTop: 12 }}>Loading…</p></div>
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
                    onView={f => setViewingFile(f)}
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
        subjectSlug={`uni-${makeSlug(decodedProgram)}-${makeSlug(activeYear || '')}-${makeSlug(activeCourse?.name || '')}`}
        defaultType={{ "Topic / Simplified":"topic", Book:"book", Questions:"questions" }[activeSection] || "topic"}
      />
    </div>
  );
}



