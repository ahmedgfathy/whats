import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import LoginEnglish from './components/Login-English';
import Dashboard from './components/Dashboard';
import DashboardEnglish from './components/Dashboard-English';
import { logoutUser, validateSession } from './services/apiService';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [language, setLanguage] = useState('arabic'); // 'arabic' or 'english'
  const [sessionExpiry, setSessionExpiry] = useState(null);

  // Session management constants
  const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry

  useEffect(() => {
    checkAuthentication();
    
    // Check saved language preference
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    // Set up session monitoring
    const interval = setInterval(checkSessionExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkAuthentication = () => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const sessionTime = localStorage.getItem('sessionTime');
    
    if (authStatus === 'true' && sessionTime) {
      const loginTime = parseInt(sessionTime);
      const currentTime = Date.now();
      const timeDiff = currentTime - loginTime;
      
      if (timeDiff < SESSION_DURATION) {
        setIsAuthenticated(true);
        setSessionExpiry(loginTime + SESSION_DURATION);
      } else {
        // Session expired
        handleLogout();
        alert('انتهت جلسة العمل. يرجى تسجيل الدخول مرة أخرى.');
      }
    }
  };

  const checkSessionExpiry = () => {
    if (!isAuthenticated || !sessionExpiry) return;
    
    const currentTime = Date.now();
    const timeLeft = sessionExpiry - currentTime;
    
    if (timeLeft <= 0) {
      handleLogout();
      alert('انتهت جلسة العمل. يرجى تسجيل الدخول مرة أخرى.');
    } else if (timeLeft <= WARNING_TIME && timeLeft > WARNING_TIME - 60000) {
      // Show warning 5 minutes before expiry (only once per minute to avoid spam)
      const minutesLeft = Math.ceil(timeLeft / 60000);
      if (confirm(`ستنتهي جلسة العمل خلال ${minutesLeft} دقائق. هل تريد تمديد الجلسة؟`)) {
        extendSession();
      }
    }
  };

  const extendSession = () => {
    const newSessionTime = Date.now();
    localStorage.setItem('sessionTime', newSessionTime.toString());
    setSessionExpiry(newSessionTime + SESSION_DURATION);
  };

  const handleLogin = () => {
    const currentTime = Date.now();
    setIsAuthenticated(true);
    setSessionExpiry(currentTime + SESSION_DURATION);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('sessionTime', currentTime.toString());
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    setSessionExpiry(null);
    
    // Use the enhanced logout function
    await logoutUser();
    
    // Clear any cached data
    localStorage.removeItem('cachedMessages');
    localStorage.removeItem('lastRefresh');
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
