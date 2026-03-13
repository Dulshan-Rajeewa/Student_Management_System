import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Login.css';

import buildingImg from '../assets/images/building.jpg';
import logoImg from '../assets/logos/kdu-logo.png';

// Hardcoded Mock Administrators
const MOCK_ADMINS = [
  { admin_id: 'ADM-001', name: 'Dulshan', email: 'dulshan@kdu.ac.lk', password: 'password123' },
  { admin_id: 'ADM-002', name: 'Behan', email: 'behan@kdu.ac.lk', password: 'password123' },
  { admin_id: 'ADM-003', name: 'Admin', email: 'admin@kdu.ac.lk', password: 'admin' }
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State for login errors
  
  const navigate = useNavigate(); // Initialize navigation

  const handleLogin = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Check if the typed email and password match any of our mock admins
    const loggedInUser = MOCK_ADMINS.find(
      (admin) => admin.email === email && admin.password === password
    );

    if (loggedInUser) {
      // 1. Save the user details to the browser's memory (localStorage)
      // We don't save the password for security best practices, even in a mock!
      const userDataToSave = {
        admin_id: loggedInUser.admin_id,
        name: loggedInUser.name,
        email: loggedInUser.email
      };
      localStorage.setItem('currentAdmin', JSON.stringify(userDataToSave));

      // 2. Redirect to the dashboard
      navigate('/dashboard');
    } else {
      // 3. Show an error message
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={buildingImg} alt="University Campus" />
      </div>

      <div className="login-right">
        <div className="login-box">
          <img src={logoImg} alt="Department Logo" className="logo" />
          
          <h2>Student Management<br/>System</h2>

          {/* Show error message if login fails */}
          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <a href="#" className="forgot-password">Forgot password?</a>

            <button type="submit" className="login-button">
              Continue
            </button>
          </form>

          {/* Just a helpful tip for testing the UI */}
          <p style={{ marginTop: '20px', fontSize: '12px', color: '#888' }}>
            Test Login: admin@kdu.ac.lk / admin
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;