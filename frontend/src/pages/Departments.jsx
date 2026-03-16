import { useParams, useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

const DEPARTMENTS = {
  "Applied Sciences and Technology": ["Computer Science","Food Technology","Hotel Catering and Institutional Management","Information Science","Mathematical Sciences","Statistical Sciences"],
  "Engineering and Technology": ["Mechanical Engineering","Electrical and Electronic Engineering","Chemical Engineering","Civil Engineering","Automotive Engineering","Oil and Gas Engineering","Mechatronics Engineering","Refrigeration and Air Conditioning"],
  "Creative Arts and Technology": ["Graphic Design","Fashion Design and Textiles","Interior Design and Technology","Communication Design"],
  "Business School": ["Accounting","Marketing","Banking and Finance","Secretaryship and Management","Procurement and Supply Chain Management","Logistics and Supply Chain Management"],
  "Built and Natural Environment": ["Estate Management","Facilities Management","Building Technology","Architectural Technology","Construction Technology","Interior Design"],
  "Health Sciences": ["Medical Laboratory Technology","Pharmaceutical Sciences","Dispensing Technology","Health Information Management","Industrial Laboratory Technology"],
  "Entrepreneurship and Enterprise Development": ["Agribusiness and Entrepreneurship","Entrepreneurship and Finance"],
  "Graduate School": ["Applied Statistics","Computer Technology","Hospitality and Catering Management","Information Science","Business Administration and Innovation","Real Estate Management","Engineering and Technology (Postgraduate)"],
};

export default function Departments() {
  const { faculty } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const accent      = { gold:"#e8b84b", blue:"#3b82f6", green:"#22c55e", rose:"#f43f5e" }[settings.accentColor] || "#e8b84b";
  const accentHover = { gold:"#c8980a", blue:"#1d4ed8", green:"#15803d", rose:"#be123c" }[settings.accentColor] || "#c8980a";
  const accentText  = { gold:"#1a1a2e", blue:"#fff",    green:"#fff",    rose:"#fff"    }[settings.accentColor] || "#1a1a2e";

  const decodedFaculty = decodeURIComponent(faculty);
  const depts = DEPARTMENTS[decodedFaculty] || [];

  const css = `
    @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    .dept-card:hover { transform:translateY(-4px) !important; box-shadow:0 14px 32px rgba(0,0,0,0.15) !important; border-color:${accentHover} !important; }
    .back-btn:hover { background:rgba(255,255,255,0.18) !important; }
  `;

  return (
    <div style={{ minHeight:"100vh", background:"#f7f7fa", paddingBottom:60 }}>
      <style>{css}</style>

      <div style={{ background:"linear-gradient(135deg,#0f0f1e,#1a1a2e)", padding:"28px 32px", display:"flex", alignItems:"flex-start", gap:14 }}>
        <button className="back-btn" style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.1)", border:"none", color:"rgba(255,255,255,0.85)", fontSize:14, cursor:"pointer", borderRadius:8, padding:"7px 14px", fontFamily:"inherit", marginTop:4, flexShrink:0 }} onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>Back
        </button>
        <div>
          <div style={{ display:"inline-block", background:`linear-gradient(135deg,${accent},${accentHover})`, color:accentText, fontWeight:"bold", fontSize:10, letterSpacing:2, padding:"2px 10px", borderRadius:4, marginBottom:8 }}>FACULTY</div>
          <h1 style={{ margin:0, color:"white", fontSize:26, fontWeight:700 }}>{decodedFaculty}</h1>
          <p style={{ margin:"6px 0 0", color:"rgba(255,255,255,0.5)", fontSize:14 }}>Select a department</p>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16, padding:"32px", maxWidth:1000, margin:"0 auto" }}>
        {depts.map((dept, i) => (
          <button key={dept} className="dept-card"
            style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"22px 24px",
              background:`linear-gradient(135deg,${accent},${accentHover})`, border:"2px solid transparent",
              borderRadius:14, cursor:"pointer", boxShadow:"0 4px 18px rgba(0,0,0,0.12)",
              animation:"fadeUp 0.4s ease both", transition:"all 0.18s", fontFamily:"inherit",
              animationDelay:`${i*55}ms` }}
            onClick={() => navigate(`/department/${encodeURIComponent(dept)}`)}>
            <span style={{ fontSize:15, fontWeight:700, color:accentText, textAlign:"left", lineHeight:1.4 }}>{dept}</span>
            <span style={{ fontSize:16, color:`${accentText}88`, flexShrink:0 }}>→</span>
          </button>
        ))}
        {depts.length === 0 && <p style={{ gridColumn:"1/-1", color:"#aaa", fontSize:15 }}>No departments listed yet.</p>}
      </div>
    </div>
  );
}
