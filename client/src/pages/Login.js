import React, { useState } from 'react';
import './Login.css';

// Import your images directly from the assets folder
// Make sure the file names match exactly what you saved!
import buildingImg from '../assets/images/building.jpg';
import logoImg from '../assets/logos/kdu-logo.png';

const Login = () => {
  // These 'states' will hold the email and password the user types
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // This function runs when the user clicks "Continue"
  const handleLogin = (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    console.log("Attempting to login with:", email, password);
    // Later, we will connect this to your Auth Service backend!
  };

  return (
    <div className="login-container">
      {/* Left Column: University Image */}
      <div className="login-left">
        <img src={buildingImg} alt="University Campus" />
      </div>

      {/* Right Column: Login Form */}
      <div className="login-right">
        <div className="login-box">
          <img src={logoImg} alt="Department Logo" className="logo" />
          
          <h2>Student Management<br/>System</h2>

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
        </div>
      </div>
    </div>
  );
};

export default Login;