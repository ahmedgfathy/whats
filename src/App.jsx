import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import LoginEnglish from './components/Login-English';
import Dashboard from './components/Dashboard';
import DashboardEnglish from './components/Dashboard-English';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [language, setLanguage] = useState('arabic'); // 'arabic' or 'english'

  useEffect(() => {
    // Check if user is already logged in
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    
    // Check saved language preference
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  const handleLanguageSwitch = () => {
    const newLanguage = language === 'arabic' ? 'english' : 'arabic';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <div className={`min-h-screen bg-gray-900 ${language === 'arabic' ? 'font-cairo' : 'font-roboto'}`}>
      <Router>
        <Routes>
          {/* Public Homepage - accessible to everyone */}
          <Route 
            path="/" 
            element={<HomePage />} 
          />
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? 
                (language === 'arabic' ? 
                  <Login onLogin={handleLogin} onLanguageSwitch={handleLanguageSwitch} /> : 
                  <LoginEnglish onLogin={handleLogin} onLanguageSwitch={handleLanguageSwitch} />
                ) : 
                <Navigate to="/dashboard" replace />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
                (language === 'arabic' ? 
                  <Dashboard onLogout={handleLogout} onLanguageSwitch={handleLanguageSwitch} /> : 
                  <DashboardEnglish onLogout={handleLogout} onLanguageSwitch={handleLanguageSwitch} />
                ) : 
                <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
