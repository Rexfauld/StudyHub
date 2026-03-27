import { createContext, useContext, useEffect, useState } from 'react';
import API from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    // Check if OAuth redirect brought back a token in the URL (?token=xxx)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('auth_token', urlToken);
      // Clean the token out of the URL without a page reload
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Now fetch current user (api.js interceptor will attach the token)
    API.get('/auth/me?_=' + Date.now())
    .then(res => setUser(res.data.user))
    .catch(() => setUser(null));
}, []);

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
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
