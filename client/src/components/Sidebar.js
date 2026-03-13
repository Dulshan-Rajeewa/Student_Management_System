import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiUserPlus, FiUsers, FiBook, FiFileText, FiSettings, FiHelpCircle, FiLogOut } from 'react-icons/fi';
import './Sidebar.css';
import logoImg from '../assets/logos/kdu-logo.png'; // Make sure this path is correct!

const Sidebar = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('Administrator');
  const [adminInitial, setAdminInitial] = useState('A');

  // Fetch logged-in user from localStorage when the sidebar loads
  useEffect(() => {
    const savedAdmin = localStorage.getItem('currentAdmin');
    if (savedAdmin) {
      const parsedAdmin = JSON.parse(savedAdmin);
      setAdminName(parsedAdmin.name);
      setAdminInitial(parsedAdmin.name.charAt(0).toUpperCase()); // Gets the first letter for the Avatar
    }
  }, []);

  const handleLogout = () => {
    // Clear the memory and send them back to the login page
    localStorage.removeItem('currentAdmin');
    navigate('/');
  };

  return (
    <div className="sidebar-container">
      {/* Top Logo */}
      <div className="sidebar-logo">
        <img src={logoImg} alt="KDU Logo" />
      </div>

      {/* Navigation Links */}
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <FiHome className="menu-icon" /> Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/register" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <FiUserPlus className="menu-icon" /> Register Student
          </NavLink>
        </li>
        <li>
          <NavLink to="/students" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <FiUsers className="menu-icon" /> Students
          </NavLink>
        </li>
        <li>
          <NavLink to="/courses" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <FiBook className="menu-icon" /> Courses
          </NavLink>
        </li>
        <li>
          <NavLink to="/audit" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <FiFileText className="menu-icon" /> Audit Logs
          </NavLink>
        </li>
      </ul>

      {/* Bottom Footer / Profile */}
      <div className="sidebar-footer">
        <ul className="sidebar-menu" style={{ padding: '0 0 15px 0' }}>
          <li>
            <NavLink to="/settings" className="sidebar-link"><FiSettings className="menu-icon" /> Settings</NavLink>
          </li>
          <li>
            <NavLink to="/support" className="sidebar-link"><FiHelpCircle className="menu-icon" /> Support</NavLink>
          </li>
          <li>
            {/* Replaced NavLink with a Button that triggers handleLogout, styled to look like a link */}
            <button onClick={handleLogout} className="sidebar-link" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
              <FiLogOut className="menu-icon" /> Logout
            </button>
          </li>
        </ul>
        
        <div className="user-profile">
          <div className="avatar">{adminInitial}</div>
          <div className="user-info">
            <p>Welcome back</p>
            <h4>{adminName}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;