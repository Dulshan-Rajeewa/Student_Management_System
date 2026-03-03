import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiUserPlus, FiUsers, FiBook, FiFileText, FiSettings, FiHelpCircle, FiLogOut } from 'react-icons/fi';
import './Sidebar.css';
import logoImg from '../assets/logos/kdu-logo.png'; // Make sure this path is correct!

const Sidebar = () => {
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
            <NavLink to="/" className="sidebar-link"><FiLogOut className="menu-icon" /> Logout</NavLink>
          </li>
        </ul>
        
        <div className="user-profile">
          <div className="avatar">D</div>
          <div className="user-info">
            <p>Welcome back</p>
            <h4>Dulshan</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;