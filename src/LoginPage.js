

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  
import './LoginPage.css';

function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();  

  const [isSignUp, setIsSignUp] = useState(false);
  const [userType, setUserType] = useState('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [answers, setAnswers] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, userType }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setMessage(`Welcome, ${data.userType}! You are logged in.`);
        onLoginSuccess(data.userType, username); 
        setLoggedIn(true); 
        setAnswers(data.answers || []); 
       
        navigate(userType === 'admin' ? '/admin' : userType === 'assessor' ? '/assessor' : '/questions');
      } else {
        setMessage(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setMessage('Error during login. Please try again later.');
    }
  };
  

  const handleSignUp = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, userType }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Sign-up successful. Please log in.');
        setIsSignUp(false);
      } else {
        setMessage(data.message || 'Sign-up failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during sign-up:', error);
      setMessage('Error during sign-up. Please try again later.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>{isSignUp ? 'Sign Up' : 'Login'}</h1>
        {message && <div className="message">{message}</div>}

        <div className="user-type">
          <label>User Type:</label>
          <select value={userType} onChange={(e) => setUserType(e.target.value)}>
            <option value="user">User</option>
            <option value="assessor">Assessor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isSignUp ? (
          <button onClick={handleSignUp}>Sign Up</button>
        ) : (
          <button onClick={handleLogin}>Login</button>
        )}

        <div className="switch-form">
          {isSignUp ? (
            <p>
              Already have an account? <span onClick={() => setIsSignUp(false)}>Login here</span>
            </p>
          ) : (
            <p>
              Don't have an account? <span onClick={() => setIsSignUp(true)}>Sign up here</span>
            </p>
          )}
        </div>

        {loggedIn && (
          <div className="answers-container">
            <h2>Your Answers:</h2>
            {answers.length === 0 ? (
              <p>No responses found for this user.</p>
            ) : (
              <ul>
                {answers.map((answerObj, index) => (
                  <li key={index}>
                    <strong>Question ID:</strong> {answerObj.questionId} | <strong>Your Answer:</strong> {answerObj.answer}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
