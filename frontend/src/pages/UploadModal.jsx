import { useState, useEffect } from 'react';
import API from '../api';
import { useSettings } from '../context/SettingsContext';

const TYPE_OPTIONS = [
  { value: 'topic',     label: 'Topic / Simplified', icon: '💡', desc: 'Notes, summaries, simplified explanations' },
  { value: 'book',      label: 'Complete Book',       icon: '📚', desc: 'Full textbooks and reference materials' },
  { value: 'questions', label: 'Past Questions',      icon: '❓', desc: 'Exam questions and practice tests' },
  { value: 'other',     label: 'Other',               icon: '📄', desc: 'Any other study material' },
];

export default function UploadModal({ open, onClose, subjectSlug, defaultType }) {
  const { settings } = useSettings();
  const accent      = { gold:"#e8b84b", blue:"#3b82f6", green:"#22c55e", rose:"#f43f5e" }[settings.accentColor] || "#e8b84b";
  const accentHover = { gold:"#c8980a", blue:"#1d4ed8", green:"#15803d", rose:"#be123c" }[settings.accentColor] || "#c8980a";
  const accentText  = { gold:"#1a1a2e", blue:"#fff",    green:"#fff",    rose:"#fff"    }[settings.accentColor] || "#1a1a2e";

  const [files,       setFiles]       = useState([]);
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [type,        setType]        = useState(defaultType || 'topic');
  const [uploading,   setUploading]   = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [error,       setError]       = useState('');
  const [currentIdx,  setCurrentIdx]  = useState(0);

  useEffect(() => {
    if (open) {
      setFiles([]); setTitle(''); setDescription('');
      setType(defaultType || 'topic');
      setUploading(false); setProgress(0); setError(''); setCurrentIdx(0);
    }
  }, [open, defaultType]);

  // When first file is picked, pre-fill title from filename
  useEffect(() => {
    if (files.length > 0 && !title) {
      const name = files[0].name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [files]);

  if (!open) return null;

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;
    setFiles(selected);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) { setFiles(dropped); setError(''); }
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const submit = async () => {
    if (!files.length) { setError('Please select at least one file.'); return; }
    if (!title.trim()) { setError('Please enter a title.'); return; }
    setUploading(true); setError('');

    for (let i = 0; i < files.length; i++) {
      setCurrentIdx(i); setProgress(0);
      const form = new FormData();
      form.append('file', files[i]);
      form.append('title', files.length > 1 ? `${title.trim()} (${i + 1})` : title.trim());
      form.append('description', description.trim());
      form.append('subjectSlug', subjectSlug);
      form.append('type', type);
      try {
        await API.post('/uploads', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total))
        });
      } catch (err) {
        setError(`Failed to upload "${files[i].name}": ${err.response?.data?.error || err.message}`);
        setUploading(false);
        return;
      }
    }

    setUploading(false);
    onClose(true); // true = success
  };

  const css = `
    @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes spin { to{transform:rotate(360deg)} }
    .um-type:hover { border-color:${accent} !important; background:#fafafa !important; }
    .um-type.selected { border-color:${accent} !important; background:${accent}12 !important; }
    .um-submit:hover:not(:disabled) { background:${accentHover} !important; transform:translateY(-1px) !important; }
    .um-cancel:hover { background:#f3f3f8 !important; }
    .um-dropzone:hover { border-color:${accent} !important; }
    .um-dropzone.dragging { border-color:${accent} !important; background:${accent}08 !important; }
    .um-input:focus { border-color:${accent} !important; box-shadow: 0 0 0 3px ${accent}20 !important; }
    .um-textarea:focus { border-color:${accent} !important; box-shadow: 0 0 0 3px ${accent}20 !important; }
  `;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}
      onClick={e => { if (e.target === e.currentTarget && !uploading) onClose(false); }}>
      <style>{css}</style>
      <div style={{ background:'white', borderRadius:20, width:'100%', maxWidth:520, maxHeight:'90vh', overflow:'auto', animation:'modalIn 0.22s ease both', boxShadow:'0 24px 80px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding:'22px 24px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:'#1a1a2e' }}>Upload File</h2>
            <p style={{ margin:'4px 0 0', fontSize:13, color:'#999' }}>Fill in the details before submitting</p>
          </div>
          {!uploading && (
            <button onClick={() => onClose(false)} style={{ background:'#f3f3f8', border:'none', borderRadius:50, width:32, height:32, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', color:'#666' }}>✕</button>
          )}
        </div>

        <div style={{ padding:'20px 24px 24px', display:'flex', flexDirection:'column', gap:18 }}>

          {/* File drop zone */}
          {!uploading && (
            <div>
              <label style={{ fontSize:13, fontWeight:600, color:'#444', display:'block', marginBottom:8 }}>File(s)</label>
              <div className="um-dropzone"
                style={{ border:'2px dashed #ddd', borderRadius:14, padding:'20px', textAlign:'center', cursor:'pointer', transition:'all 0.18s', background:'#fafafa' }}
                onClick={() => document.getElementById('um-file-input').click()}
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dragging'); }}
                onDragLeave={e => e.currentTarget.classList.remove('dragging')}>
                <input id="um-file-input" type="file" multiple style={{ display:'none' }} onChange={handleFileChange} />
                {files.length === 0 ? (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:'#f0f0f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>📁</div>
                    <p style={{ margin:0, fontSize:14, fontWeight:600, color:'#1a1a2e' }}>Click or drag files here</p>
                    <p style={{ margin:0, fontSize:12, color:'#aaa' }}>PDFs, images, documents — any format</p>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:8, textAlign:'left' }} onClick={e => e.stopPropagation()}>
                    {files.map((f, i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:10, background:'white', border:'1px solid #eee', borderRadius:10, padding:'8px 12px' }}>
                        <span style={{ fontSize:20 }}>{f.type.includes('image') ? '🖼️' : f.type.includes('pdf') ? '📄' : '📎'}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#1a1a2e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</p>
                          <p style={{ margin:0, fontSize:11, color:'#aaa' }}>{formatSize(f.size)}</p>
                        </div>
                        <button onClick={() => removeFile(i)} style={{ background:'none', border:'none', color:'#ccc', cursor:'pointer', fontSize:16, padding:'2px 4px', flexShrink:0 }}>✕</button>
                      </div>
                    ))}
                    <button style={{ fontSize:12, color:accent, background:'none', border:'none', cursor:'pointer', textAlign:'left', padding:'4px 0', fontWeight:600 }}
                      onClick={() => document.getElementById('um-file-input').click()}>+ Add more files</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress while uploading */}
          {uploading && (
            <div style={{ background:'#f7f7fa', borderRadius:14, padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" style={{ animation:'spin 0.9s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <div style={{ textAlign:'center' }}>
                <p style={{ margin:0, fontWeight:700, color:'#1a1a2e', fontSize:15 }}>
                  Uploading {files.length > 1 ? `file ${currentIdx + 1} of ${files.length}` : `"${files[0]?.name.length > 28 ? files[0].name.slice(0,28)+'…' : files[0]?.name}"`}
                </p>
                <p style={{ margin:'4px 0 0', fontSize:13, color:'#999' }}>{progress}% uploaded</p>
              </div>
              <div style={{ width:'100%', background:'#e8e8f0', borderRadius:50, height:8, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(90deg,${accent},${accentHover})`, borderRadius:50, transition:'width 0.2s ease' }} />
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:'#444', display:'block', marginBottom:8 }}>
              Title <span style={{ color:'#e11d48' }}>*</span>
            </label>
            <input className="um-input"
              style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1.5px solid #e5e5e5', fontSize:14, outline:'none', fontFamily:'inherit', transition:'all 0.18s', boxSizing:'border-box', color:'#1a1a2e' }}
              placeholder="e.g. Mathematics Past Questions 2023"
              value={title} onChange={e => setTitle(e.target.value)}
              disabled={uploading} maxLength={100} />
            <p style={{ margin:'4px 0 0', fontSize:11, color:'#bbb', textAlign:'right' }}>{title.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:'#444', display:'block', marginBottom:8 }}>
              Description <span style={{ color:'#bbb', fontWeight:400 }}>(optional)</span>
            </label>
            <textarea className="um-textarea"
              style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1.5px solid #e5e5e5', fontSize:14, outline:'none', fontFamily:'inherit', transition:'all 0.18s', boxSizing:'border-box', resize:'vertical', minHeight:80, color:'#1a1a2e' }}
              placeholder="Brief description of the content…"
              value={description} onChange={e => setDescription(e.target.value)}
              disabled={uploading} maxLength={300} />
            <p style={{ margin:'4px 0 0', fontSize:11, color:'#bbb', textAlign:'right' }}>{description.length}/300</p>
          </div>

          {/* Type selector */}
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:'#444', display:'block', marginBottom:8 }}>Type</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {TYPE_OPTIONS.map(opt => (
                <button key={opt.value} className={`um-type${type === opt.value ? ' selected' : ''}`}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, border:'1.5px solid #e5e5e5', background:'white', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s', textAlign:'left' }}
                  onClick={() => setType(opt.value)} disabled={uploading}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{opt.icon}</span>
                  <div>
                    <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#1a1a2e' }}>{opt.label}</p>
                    <p style={{ margin:0, fontSize:11, color:'#aaa', lineHeight:1.4 }}>{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', color:'#dc2626', borderRadius:10, padding:'10px 14px', fontSize:13 }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display:'flex', gap:10 }}>
            {!uploading && (
              <button className="um-cancel"
                style={{ flex:1, padding:'12px', borderRadius:12, border:'1.5px solid #e5e5e5', background:'white', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#666', transition:'all 0.15s' }}
                onClick={() => onClose(false)}>
                Cancel
              </button>
            )}
            <button className="um-submit"
              style={{ flex:2, padding:'12px', borderRadius:12, border:'none', background:`linear-gradient(135deg,${accent},${accentHover})`, color:accentText, fontSize:14, fontWeight:700, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily:'inherit', transition:'all 0.18s', opacity: uploading ? 0.7 : 1 }}
              onClick={submit} disabled={uploading}>
              {uploading ? `Uploading ${files.length > 1 ? `(${currentIdx+1}/${files.length})` : '…'}` : `Submit ${files.length > 1 ? `${files.length} Files` : 'File'}`}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
