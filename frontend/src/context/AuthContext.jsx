import { createContext, useContext, useEffect, useState } from 'react';
import API from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    API.get('/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const logout = () => {
    setUser(null);
    // Force full page navigation to backend logout, which clears the session cookie
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/logout`;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
