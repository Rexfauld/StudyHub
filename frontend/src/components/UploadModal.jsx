import React, { useState } from 'react';
import API from '../api';

export default function UploadModal({ open, onClose, subject, level }){
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('topic');

  if (!open) return null;

  const submit = async () => {
    if (!file) return alert('Choose file');
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    form.append('subjectSlug', `${level}-${subject?.toLowerCase().replace(/\s+/g,'-')}`);
    form.append('type', type);
    try {
      const res = await API.post('/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Uploaded — pending admin approval');
      onClose();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  return (
    <div style={{
      position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',
      background:'rgba(0,0,0,0.4)'
    }}>
      <div style={{background:'white',padding:20,width:520,borderRadius:8}}>
        <h3>Upload for {subject}</h3>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
        <select value={type} onChange={e=>setType(e.target.value)}>
          <option value="book">Complete Book</option>
          <option value="topic">Topic / Simplified</option>
          <option value="questions">Questions</option>
          <option value="photo">Photo</option>
        </select>
        <input type="file" onChange={e=>setFile(e.target.files[0])} />
        <div style={{display:'flex',gap:8,marginTop:12}}>
          <button onClick={submit}>Send</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}