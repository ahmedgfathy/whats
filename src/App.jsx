import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './components/Login';
// import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect(() => {
  //   // Check if user is already logged in
  //   const authStatus = localStorage.getItem('isAuthenticated');
  //   if (authStatus === 'true') {
  //     setIsAuthenticated(true);
  //   }
  // }, []);

  // const handleLogin = () => {
  //   setIsAuthenticated(true);
  //   localStorage.setItem('isAuthenticated', 'true');
  // };

  // const handleLogout = () => {
  //   setIsAuthenticated(false);
  //   localStorage.removeItem('isAuthenticated');
  // };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Real Estate Chat Search</h1>
      <p className="text-lg">Arabic Real Estate WhatsApp Chat Application</p>
      <p className="text-sm mt-4 text-gray-400">Application is loading step by step...</p>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-900">
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? 
                <Login onLogin={handleLogin} /> : 
                <Navigate to="/dashboard" replace />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
                <Dashboard onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
