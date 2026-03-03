import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const Dashboard = () => {
  
  useEffect(() => {
    document.title = "Dashboard | KDU SMS";
  }, []);

  return (
    <div className="dashboard-layout">
      {/* Insert the reusable Sidebar here */}
      <Sidebar />

      {/* Main Right-Side Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome, Administrator</p>
        </div>

        {/* The 4 KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-info">
              <h3>Total Students</h3>
              <h2>1,050</h2>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-info">
              <h3>Degree Programs</h3>
              <h2>4</h2>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-info">
              <h3>Active Courses</h3>
              <h2>32</h2>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-info">
              <h3>New Registrations</h3>
              <h2>45</h2>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="chart-placeholder">
          <p>Student Enrollment Trends Chart (To be implemented)</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;