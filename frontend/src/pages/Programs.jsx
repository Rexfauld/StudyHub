import { useParams, useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

const PROGRAMS = {
  "Computer Science": ["HND Computer Science","BTech Computer Technology","BTech Artificial Intelligence","MTech Computer Technology","Diploma in Hardware & Networking CTVET","Diploma in Web Applications and Database CTVET","Diploma in Information Technology","Diploma in Information Technology (Tertiary)"],
  "Food Technology": ["BTech Food Technology","MTech Food Processing Technology","Diploma in Food Processing Technology (Tertiary)"],
  "Hotel Catering and Institutional Management": ["HND Hotel, Catering and Institutional Management","BTech Hospitality Management and Catering Technology","MSc Hospitality and Catering Management","Diploma in Hospitality Operations and Management"],
  "Information Science": ["BSc Information Science","BSc Library and Information Science","BTech Library and Information Sciences","MSc Information Science","Diploma In Library And Information Science","Diploma in Information Technology (Tertiary)"],
  "Mathematical Sciences": ["BSc Applied Mathematics"],
  "Statistical Sciences": ["HND Statistics","Higher Diploma In Health Statistics","BSc Applied Statistics (Environmental Statistics)","BSc Applied Statistics (Financial Statistics)","BSc Applied Statistics (Health Statistics)","BTech Data Science","MTech Applied Statistics (Environmental Statistics)","MTech Applied Statistics (Financial Statistics)","MTech Applied Statistics (Health Statistics)","Diploma in Health Statistics","Diploma in Health Statistics (Tertiary)","PhD Applied Statistics","BSc Health Information Management"],
  "Mechanical Engineering": ["BTech Mechanical Engineering (Manufacturing)","BTech Mechanical Engineering (Metallurgy And Materials)","BTech Mechanical Engineering (Plant)","HND Mechanical Engineering (Production Option)","HND Mechanical Engineering (Metallurgy & Foundry)","HND Mechanical Engineering (Plant)","MTech Mechanical Engineering","MEng Mechanical Engineering","Diploma in Mechanical Engineering","Diploma in Mechanical Engineering (Tertiary)"],
  "Electrical and Electronic Engineering": ["BEng Electrical and Electronic Engineering","BTech Electrical and Electronic Engineering","HND Electrical and Electronic Engineering","MTech Power Systems and Energetics Engineering","MTech Power Systems and Energetics Engineering (Non-Research)","Diploma in Electrical and Electronic Engineering CTVET"],
  "Chemical Engineering": ["BEng Chemical Engineering","HND Chemical Engineering","MTech Chemical Engineering","MEng Chemical Engineering","Diploma in Chemical Engineering"],
  "Civil Engineering": ["BEng Civil Engineering","BTech Civil Engineering","HND Civil Engineering","MTech Civil Engineering (Roads and Highway Engineering)","MTech Civil Engineering (Water & Environmental Engineering)","MEng Civil Engineering (Highway and Transportation Engineering)","MEng Civil Engineering (Structural Engineering)","MEng Civil Engineering (Water and Environmental Engineering)","Diploma in Civil Engineering (Tertiary)"],
  "Automotive Engineering": ["BEng Automotive Engineering","BTech Automotive Engineering","HND Automotive Engineering","MTech Automotive Engineering","MEng Automotive Engineering","DTech Automotive Engineering","Diploma in Automotive Engineering","Diploma in Automotive Engineering (Tertiary)"],
  "Oil and Gas Engineering": ["BEng Oil and Gas Engineering"],
  "Mechatronics Engineering": ["BEng Mechatronics Engineering","Diploma in Mechatronics Engineering (Tertiary)"],
  "Refrigeration and Air Conditioning": ["BEng Refrigeration and Air Conditioning"],
  "Graphic Design": ["Diploma In Graphic Design"],
  "Fashion Design and Textiles": ["BTech Fashion Design and Textiles Studies","BTech Textiles Production and Soft Furnishing","HND Fashion Design And Textiles Studies","Diploma in Fashion Design and Textiles","Diploma in Fashion Design Studies (Tertiary)"],
  "Interior Design and Technology": ["BTech Interior Design Technology","HND Interior Design And Technology","MTech Interior Design and Resource Management"],
  "Communication Design": ["BA Communication Design"],
  "Accounting": ["BSc Accountancy with Computing","HND Accountancy","HND Accounting With Computing","BTech Accounting","MTech Accounting With Information Systems","MSc Business Administration and Innovation (Accountancy)","Diploma in Computerized Accounting","Diploma in Computerized Accounting (Tertiary)"],
  "Marketing": ["BSc Marketing","HND Marketing","MSc Business Administration and Innovation (Strategic Marketing)","MA Marketing Management","Diploma in Electronic Marketing CTVET"],
  "Banking and Finance": ["BSc Banking And Finance","BSc Sustainable Banking And Finance","HND Banking Technology And Finance","MSc Banking and Finance","MSc Business Administration and Innovation (Banking and Finance)","Diploma in Banking and Small Business Management","Diploma in Banking Technology and Finance","Diploma in Banking Technology and Finance (Tertiary)"],
  "Secretaryship and Management": ["BA Secretaryship And Management","HND Secretaryship and Management Studies"],
  "Procurement and Supply Chain Management": ["BSc Procurement and Supply Chain Management","BSc Supply Chain and Data Analytics","HND Purchasing and Supply","MSc Business Administration and Innovation (Procurement and Supply Chain Management)","Diploma in Procurement & Materials Management","Diploma in Procurement and Supply Chain Management (Tertiary)"],
  "Logistics and Supply Chain Management": ["MSc Logistics and Supply Chain Management","MSc Business Administration and Innovation (Logistics and Supply Chain Management)"],
  "Estate Management": ["BSc Estate Management","HND Estate Management","BTech Estate Management (Top Up)","MSc Real Estate Management"],
  "Facilities Management": ["BSc Facilities Management"],
  "Building Technology": ["BTech Building Technology","MTech Construction Technology","MTech Construction Project Management","Diploma in Construction Technology (Tertiary)"],
  "Architectural Technology": ["BTech Architectural Technology"],
  "Construction Technology": ["MTech Construction Technology","Diploma in Construction Technology (Tertiary)"],
  "Interior Design": ["BTech Interior Design Technology","MTech Interior Design and Resource Management"],
  "Medical Laboratory Technology": ["BTech Medical Laboratory Technology","HND Medical Laboratory Technology"],
  "Pharmaceutical Sciences": ["BTech Pharmaceutical Sciences","MTech Pharmaceutical Formulation"],
  "Dispensing Technology": ["HND Dispensing Technology","HND In Dispensing Technology"],
  "Health Information Management": ["BSc Health Information Management"],
  "Industrial Laboratory Technology": ["BTech Industrial Laboratory Technology","HND Industrial Laboratory","HND Science and Industrial Laboratory Technology"],
  "Agribusiness and Entrepreneurship": ["BSc Agribusiness with Entrepreneurship","BTech Agribusiness with Entrepreneurship","HND Agribusiness and Entrepreneurship","MSc Agribusiness And Food Industry Management"],
  "Entrepreneurship and Finance": ["BSc Entrepreneurship & Finance","HND Entrepreneurship and Finance"],
  "Applied Statistics": ["MTech Applied Statistics (Environmental Statistics)","MTech Applied Statistics (Financial Statistics)","MTech Applied Statistics (Health Statistics)","PhD Applied Statistics"],
  "Computer Technology": ["MTech Computer Technology"],
  "Hospitality and Catering Management": ["MSc Hospitality and Catering Management"],
  "Business Administration and Innovation": ["MSc Business Administration and Innovation (Accountancy)","MSc Business Administration and Innovation (Banking and Finance)","MSc Business Administration and Innovation (Logistics and Supply Chain Management)","MSc Business Administration and Innovation (Management Organizational Development)","MSc Business Administration and Innovation (Procurement and Supply Chain Management)","MSc Business Administration and Innovation (Strategic Marketing)","MA Marketing Management","MSc Banking and Finance","MSc Logistics and Supply Chain Management"],
  "Real Estate Management": ["MSc Real Estate Management"],
  "Engineering and Technology (Postgraduate)": ["MEng Automotive Engineering","MEng Chemical Engineering","MEng Civil Engineering (Highway and Transportation Engineering)","MEng Civil Engineering (Structural Engineering)","MEng Civil Engineering (Water and Environmental Engineering)","MTech Automotive Engineering","MTech Chemical Engineering","MTech Civil Engineering (Roads and Highway Engineering)","MTech Civil Engineering (Water & Environmental Engineering)","MTech Power Systems and Energetics Engineering","MTech Water and Environmental Engineering","DTech Automotive Engineering","DTech Chemical Engineering","DTech Civil Engineering"],
};

export default function Programs() {
  const { department } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const accent      = { gold:"#e8b84b", blue:"#3b82f6", green:"#22c55e", rose:"#f43f5e" }[settings.accentColor] || "#e8b84b";
  const accentHover = { gold:"#c8980a", blue:"#1d4ed8", green:"#15803d", rose:"#be123c" }[settings.accentColor] || "#c8980a";
  const accentText  = { gold:"#1a1a2e", blue:"#fff",    green:"#fff",    rose:"#fff"    }[settings.accentColor] || "#1a1a2e";

  const decodedDept = decodeURIComponent(department);
  const progs = PROGRAMS[decodedDept] || [];

  const css = `
    @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    .prog-card:hover { transform:translateY(-4px) !important; box-shadow:0 14px 32px rgba(0,0,0,0.15) !important; border-color:${accentHover} !important; }
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
          <div style={{ display:"inline-block", background:`linear-gradient(135deg,${accent},${accentHover})`, color:accentText, fontWeight:"bold", fontSize:10, letterSpacing:2, padding:"2px 10px", borderRadius:4, marginBottom:8 }}>DEPARTMENT</div>
          <h1 style={{ margin:0, color:"white", fontSize:26, fontWeight:700 }}>{decodedDept}</h1>
          <p style={{ margin:"6px 0 0", color:"rgba(255,255,255,0.5)", fontSize:14 }}>Select a program</p>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16, padding:"32px", maxWidth:1100, margin:"0 auto" }}>
        {progs.map((prog, i) => (
          <button key={prog} className="prog-card"
            style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"20px 22px",
              background:`linear-gradient(135deg,${accent},${accentHover})`, border:"2px solid transparent",
              borderRadius:14, cursor:"pointer", boxShadow:"0 4px 18px rgba(0,0,0,0.12)",
              animation:"fadeUp 0.4s ease both", transition:"all 0.18s", fontFamily:"inherit",
              animationDelay:`${i*45}ms` }}
            onClick={() => navigate(`/program/${encodeURIComponent(prog)}`)}>
            <span style={{ fontSize:14, fontWeight:700, color:accentText, textAlign:"left", lineHeight:1.4 }}>{prog}</span>
            <span style={{ fontSize:16, color:`${accentText}88`, flexShrink:0 }}>→</span>
          </button>
        ))}
        {progs.length === 0 && <p style={{ gridColumn:"1/-1", color:"#aaa", fontSize:15 }}>No programs listed yet.</p>}
      </div>
    </div>
  );
}
