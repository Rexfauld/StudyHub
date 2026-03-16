import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import Home from './pages/Home';
import JHS from './pages/JHS';
import SHS from './pages/SHS';
import University from './pages/University';
import Departments from './pages/Departments';
import Programs from './pages/Programs';
import Courses from './pages/Courses';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import Header from './components/Header';
import SHSSubjects from './pages/SHSSubjects';
import SearchResults from './pages/SearchResults';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';

function AuthRedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('auth') === 'success') {
      navigate('/', { replace: true });
      window.location.reload();
    }
    if (params.get('auth') === 'fail') {
      navigate('/', { replace: true });
    }
  }, [location]);

  return null;
}

function AppInner() {
  return (
    <>
      <AuthRedirectHandler />
      <Header />
      <main>
        <Routes>
          <Route path="/"                         element={<Home />} />
          <Route path="/jhs"                      element={<JHS />} />
          <Route path="/shs"                      element={<SHS />} />
          <Route path="/university"               element={<University />} />
          <Route path="/faculty/:faculty"         element={<Departments />} />
          <Route path="/department/:department"   element={<Programs />} />
          <Route path="/program/:program"         element={<Courses />} />
          <Route path="/settings"                 element={<Settings />} />
          <Route path="/admin"                    element={<AdminDashboard />} />
          <Route path="/shs/:course"              element={<SHSSubjects />} />
          <Route path="/search"                   element={<SearchResults />} />
          <Route path="/profile"                  element={<Profile />} />
          <Route path="*"                         element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </AuthProvider>
      </ToastProvider>
    </SettingsProvider>
  );
}
