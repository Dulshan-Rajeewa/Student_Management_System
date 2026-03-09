import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import './Settings.css';
import '../pages/RegisterStudent.css'; // Reusing input styles!

const Settings = () => {
  useEffect(() => {
    document.title = "Settings | KDU SMS";
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    alert("Settings saved successfully!");
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="dashboard-header" style={{ marginBottom: '30px' }}>
          <h1>System Settings</h1>
        </div>

        <div className="settings-container">
          
          {/* Profile Section */}
          <div className="settings-section">
            <h3>Administrator Profile</h3>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" defaultValue="Dulshan Administrator" />
                </div>
                <div className="input-group">
                  <label>Admin ID</label>
                  <input type="text" defaultValue="ADM-2026-01" disabled style={{ background: '#f5f5f5' }} />
                </div>
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input type="email" defaultValue="admin@kdu.ac.lk" />
              </div>
              <button type="submit" className="btn-save" style={{ marginTop: '10px' }}>Update Profile</button>
            </form>
          </div>

          {/* Security Section */}
          <div className="settings-section">
            <h3>Security</h3>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="input-group">
                  <label>New Password</label>
                  <input type="password" placeholder="Enter new password" />
                </div>
                <div className="input-group">
                  <label>Confirm Password</label>
                  <input type="password" placeholder="Confirm new password" />
                </div>
              </div>
              <button type="submit" className="btn-save" style={{ marginTop: '10px' }}>Change Password</button>
            </form>
          </div>

          {/* System Preferences Section */}
          <div className="settings-section">
            <h3>System Preferences</h3>
            <div className="toggle-group">
              <div className="toggle-label">
                <h4>Email Notifications</h4>
                <p>Receive alerts when a new student is registered.</p>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-group">
              <div className="toggle-label">
                <h4>Dark Mode</h4>
                <p>Switch the dashboard to a dark color theme.</p>
              </div>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
          </div>

        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Settings;