import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import AdminDashboard from './AdminDashboard';
import QuestionTable from './QuestionTable';
import AssessorTable from './AssessorTable';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [username, setUsername] = useState('');

  const handleLoginSuccess = (type, username) => {
    setUserType(type);
    setIsAuthenticated(true);
    setUsername(username);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserType(null);
    setIsAuthenticated(false);
    setUsername('');
  };

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated && (
          <div className="logout-container">
            <span>Welcome, {username}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        )}

        {isAuthenticated ? (
          <Routes>
            {userType === 'admin' && (
              <Route path="/admin/*" element={<AdminDashboard />} />
            )}
            {userType === 'assessor' && (
              <Route path="/assessor" element={<AssessorTable username={username} />} />
            )}
            {userType === 'user' && (
              <Route path="/questions" element={<QuestionTable username={username} />} />
            )}
            <Route path="*" element={<Navigate to={userType === 'admin' ? "/admin" : userType === 'assessor' ? "/assessor" : "/questions"} />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;
