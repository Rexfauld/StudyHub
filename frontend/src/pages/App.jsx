import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Home from './pages/Home';
import JHS from './pages/JHS';
import SHS from './pages/SHS';
import University from './pages/University';
import Departments from './pages/Departments';
import Programs from './pages/Programs';
import Courses from './pages/Courses';
import Settings from './pages/Settings';
import Header from './components/Header';
import SHSSubjects from './pages/SHSSubjects';

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <main style={{ padding: 20 }}>
            <Routes>
              <Route path="/"                         element={<Home />} />
              <Route path="/jhs"                      element={<JHS />} />
              <Route path="/shs"                      element={<SHS />} />
              <Route path="/university"               element={<University />} />
              <Route path="/faculty/:faculty"         element={<Departments />} />
              <Route path="/department/:department"   element={<Programs />} />
              <Route path="/program/:program"         element={<Courses />} />
              <Route path="/settings"                 element={<Settings />} />
              <Route path="/shs/:course"              element={<SHSSubjects />} />
            </Routes>
          </main>
        </BrowserRouter>
      </AuthProvider>
    </SettingsProvider>
  );
}
