import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SignInModal from './SignInModal';

export default function Header() {
  const { user, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [search, setSearch]       = useState('');
  const dropRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (!dropRef.current?.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [navigate]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setMenuOpen(false);
    }
  };

  const handleSearchBtn = () => {
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <header className="sh-header">
        {/* Logo */}
        <Link to="/" className="sh-logo">
          <div className="sh-logomark">S</div>
          <span className="sh-logotext">StudyHub</span>
        </Link>

        {/* Desktop search */}
        <div className="sh-searchwrap sh-desktop-only">
          <svg className="sh-searchicon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input className="sh-search" placeholder="Search subjects, topics…" value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch} />
        </div>

        {/* Desktop nav */}
        <nav className="sh-nav sh-desktop-only">
          <Link to="/"           className="sh-navlink">Home</Link>
          <Link to="/jhs"        className="sh-navlink">JHS</Link>
          <Link to="/shs"        className="sh-navlink">SHS</Link>
          <Link to="/university" className="sh-navlink">University</Link>
          <Link to="/settings"   className="sh-settings" title="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </Link>
          {user === undefined ? (
            <div className="sh-skeleton" />
          ) : user ? (
            <div ref={dropRef} style={{ position:'relative' }}>
              <button className="sh-avatarbtn" onClick={() => setDropOpen(v => !v)}>
                <div className="sh-avatar">{user.name?.[0]?.toUpperCase() || '?'}</div>
                <span className="sh-avatarname">{user.name?.split(' ')[0]}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {dropOpen && (
                <div className="sh-dropdown">
                  <div className="sh-dropheader">
                    <div className="sh-dropavatar">{user.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className="sh-dropname">{user.name}</div>
                      <div className="sh-dropemail">{user.email}</div>
                    </div>
                  </div>
                  <div className="sh-dropdivider" />
                  {user.role === 'admin' && (
                    <Link to="/admin" className="sh-dropitem sh-dropitem--admin" onClick={() => setDropOpen(false)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      Admin Panel
                    </Link>
                  )}
                  <Link to="/settings" className="sh-dropitem" onClick={() => setDropOpen(false)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                    Settings
                  </Link>
                  <button className="sh-dropitembtn" onClick={() => { setDropOpen(false); logout(); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="sh-signinbtn" onClick={() => setModalOpen(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Sign In
            </button>
          )}
        </nav>

        {/* Mobile right: sign-in + hamburger */}
        <div className="sh-mobile-right sh-mobile-only">
          {user === undefined ? null : user ? (
            <div className="sh-avatar sh-avatar--sm" onClick={() => setMenuOpen(v => !v)}>
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
          ) : (
            <button className="sh-signinbtn sh-signinbtn--sm" onClick={() => setModalOpen(true)}>Sign In</button>
          )}
          <button className="sh-hambtn" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            <span className={`sh-ham ${menuOpen ? 'sh-ham--open' : ''}`}>
              <span /><span /><span />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="sh-drawer">
          {/* Search */}
          <div className="sh-drawer-search">
            <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className="sh-drawer-input" placeholder="Search…" value={search}
              onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch} />
            <button className="sh-drawer-searchbtn" onClick={handleSearchBtn}>Go</button>
          </div>
          {/* Nav links */}
          <nav className="sh-drawer-nav">
            {[['/', 'Home'], ['/jhs','JHS'], ['/shs','SHS'], ['/university','University'], ['/settings','Settings']].map(([to, label]) => (
              <Link key={to} to={to} className="sh-drawer-link" onClick={() => setMenuOpen(false)}>{label}</Link>
            ))}
            {user?.role === 'admin' && (
              <Link to="/admin" className="sh-drawer-link sh-drawer-link--admin" onClick={() => setMenuOpen(false)}>⭐ Admin Panel</Link>
            )}
          </nav>
          {/* User info */}
          {user && (
            <div className="sh-drawer-user">
              <div className="sh-drawer-userinfo">
                <div className="sh-dropavatar">{user.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div className="sh-dropname">{user.name}</div>
                  <div className="sh-dropemail">{user.email}</div>
                </div>
              </div>
              <button className="sh-drawer-signout" onClick={() => { logout(); setMenuOpen(false); }}>Sign Out</button>
            </div>
          )}
        </div>
      )}

      <SignInModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

const css = `
  /* === BASE HEADER === */
  .sh-header {
    background: linear-gradient(135deg,#0f0f1e 0%,#1a1a2e 60%,#16213e 100%);
    padding: 0 24px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-shadow: 0 2px 20px rgba(0,0,0,0.25);
    position: sticky;
    top: 0;
    z-index: 200;
  }
  .sh-logo { display:flex; align-items:center; gap:8px; text-decoration:none; flex-shrink:0; }
  .sh-logomark { width:32px; height:32px; border-radius:8px; background:linear-gradient(135deg,#e8b84b,#f0c96a); color:#1a1a2e; font-size:17px; font-weight:900; display:flex; align-items:center; justify-content:center; }
  .sh-logotext { color:white; font-weight:700; font-size:17px; letter-spacing:-0.4px; }

  /* === DESKTOP SEARCH === */
  .sh-searchwrap { flex:1; max-width:360px; position:relative; }
  .sh-searchicon { position:absolute; left:12px; top:50%; transform:translateY(-50%); pointer-events:none; }
  .sh-search { width:100%; padding:8px 12px 8px 36px; border-radius:10px; border:1.5px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.08); color:white; font-size:14px; outline:none; font-family:inherit; box-sizing:border-box; transition:border-color 0.2s; }
  .sh-search:focus { border-color:rgba(232,184,75,0.5); }
  .sh-search::placeholder { color:rgba(255,255,255,0.35); }

  /* === DESKTOP NAV === */
  .sh-nav { display:flex; align-items:center; gap:4px; flex-shrink:0; }
  .sh-navlink { color:rgba(255,255,255,0.7); text-decoration:none; font-size:14px; font-weight:500; padding:6px 10px; border-radius:8px; transition:all 0.18s; white-space:nowrap; }
  .sh-navlink:hover { color:white; background:rgba(255,255,255,0.1); }
  .sh-settings { display:flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius:9px; background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.1); transition:all 0.18s; }
  .sh-settings:hover { background:rgba(255,255,255,0.15); border-color:rgba(232,184,75,0.4); }
  .sh-settings:hover svg { stroke:#e8b84b !important; }
  .sh-signinbtn { display:flex; align-items:center; gap:6px; padding:7px 16px; border-radius:50px; background:linear-gradient(135deg,#e8b84b,#f0c96a); color:#1a1a2e; border:none; font-size:14px; font-weight:700; cursor:pointer; box-shadow:0 4px 14px rgba(232,184,75,0.3); transition:all 0.2s; font-family:inherit; white-space:nowrap; }
  .sh-signinbtn:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(232,184,75,0.45); }
  .sh-signinbtn--sm { font-size:13px; padding:6px 14px; }
  .sh-avatarbtn { display:flex; align-items:center; gap:7px; background:rgba(255,255,255,0.1); border:1.5px solid rgba(255,255,255,0.12); border-radius:50px; padding:4px 12px 4px 4px; cursor:pointer; color:white; font-size:14px; font-weight:500; transition:all 0.18s; font-family:inherit; }
  .sh-avatar { width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,#e8b84b,#f0c96a); color:#1a1a2e; font-weight:800; font-size:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .sh-avatar--sm { width:32px; height:32px; font-size:14px; cursor:pointer; }
  .sh-avatarname { font-size:14px; color:white; font-weight:500; }
  .sh-skeleton { width:90px; height:34px; border-radius:50px; background:rgba(255,255,255,0.08); }

  /* === DROPDOWN === */
  .sh-dropdown { position:absolute; top:calc(100% + 10px); right:0; background:white; border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,0.18); min-width:220px; overflow:hidden; animation:dropIn 0.2s cubic-bezier(.34,1.56,.64,1) both; }
  .sh-dropheader { display:flex; align-items:center; gap:10px; padding:14px 14px 10px; }
  .sh-dropavatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#1a1a2e,#16213e); color:white; font-weight:800; font-size:15px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .sh-dropname { font-weight:700; font-size:14px; color:#111; }
  .sh-dropemail { font-size:11px; color:#888; margin-top:1px; word-break:break-all; }
  .sh-dropdivider { height:1px; background:#f0f0f2; margin:0 10px; }
  .sh-dropitem { display:flex; align-items:center; gap:10px; padding:11px 14px; color:#333; text-decoration:none; font-size:14px; transition:background 0.15s; }
  .sh-dropitem:hover { background:#f7f7fa; }
  .sh-dropitem--admin { color:#e8b84b !important; font-weight:700; }
  .sh-dropitembtn { display:flex; align-items:center; gap:10px; padding:11px 14px; color:#e53e3e; background:none; border:none; width:100%; text-align:left; font-size:14px; cursor:pointer; font-family:inherit; transition:background 0.15s; }
  .sh-dropitembtn:hover { background:#fff5f5; }

  /* === MOBILE HAMBURGER === */
  .sh-hambtn { background:none; border:none; cursor:pointer; padding:6px; display:flex; align-items:center; justify-content:center; }
  .sh-ham { display:flex; flex-direction:column; gap:5px; width:22px; }
  .sh-ham span { display:block; height:2px; background:rgba(255,255,255,0.8); border-radius:2px; transition:all 0.25s; }
  .sh-ham--open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
  .sh-ham--open span:nth-child(2) { opacity:0; }
  .sh-ham--open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
  .sh-mobile-right { display:flex; align-items:center; gap:8px; }

  /* === MOBILE DRAWER === */
  .sh-drawer { position:fixed; top:60px; left:0; right:0; bottom:0; background:#0f0f1e; z-index:199; overflow-y:auto; padding:20px 20px 40px; display:flex; flex-direction:column; gap:16px; animation:drawerIn 0.22s ease both; }
  .sh-drawer-search { position:relative; display:flex; gap:8px; }
  .sh-drawer-input { flex:1; padding:12px 12px 12px 38px; border-radius:12px; border:1.5px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.08); color:white; font-size:15px; outline:none; font-family:inherit; }
  .sh-drawer-input::placeholder { color:rgba(255,255,255,0.3); }
  .sh-drawer-searchbtn { padding:12px 18px; border-radius:12px; background:#e8b84b; color:#1a1a2e; border:none; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; }
  .sh-drawer-nav { display:flex; flex-direction:column; gap:4px; }
  .sh-drawer-link { display:block; padding:14px 16px; border-radius:12px; color:rgba(255,255,255,0.75); text-decoration:none; font-size:16px; font-weight:500; transition:all 0.15s; }
  .sh-drawer-link:hover, .sh-drawer-link:active { background:rgba(255,255,255,0.08); color:white; }
  .sh-drawer-link--admin { color:#e8b84b !important; font-weight:700; }
  .sh-drawer-user { border-top:1px solid rgba(255,255,255,0.08); padding-top:16px; display:flex; flex-direction:column; gap:12px; }
  .sh-drawer-userinfo { display:flex; align-items:center; gap:12px; }
  .sh-drawer-signout { padding:12px; border-radius:12px; background:rgba(229,62,62,0.12); color:#fc8181; border:1px solid rgba(229,62,62,0.2); font-size:15px; font-weight:600; cursor:pointer; font-family:inherit; }

  /* === VISIBILITY TOGGLES === */
  .sh-desktop-only { display:flex; }
  .sh-mobile-only  { display:none; }

  @media (max-width: 768px) {
    .sh-desktop-only { display:none !important; }
    .sh-mobile-only  { display:flex !important; }
    .sh-header { padding:0 16px; }
  }

  @keyframes dropIn { from{opacity:0;transform:translateY(-8px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes drawerIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
`;
