import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { FiUsers, FiAward, FiBookOpen, FiUserPlus } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {

  useEffect(() => {
    document.title = "Dashboard | KDU SMS";
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="main-content">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <h2>Welcome, Administrator</h2>
        </div>

        {/* KPI SECTION (Matches Figma 2x2 Grid) */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon"><FiUsers /></div>
            <div className="kpi-text">
              <p>Total Students</p>
              <h3>932</h3>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon"><FiAward /></div>
            <div className="kpi-text">
              <p>Degree Programs</p>
              <h3>4</h3>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon"><FiBookOpen /></div>
            <div className="kpi-text">
              <p>Active Courses</p>
              <h3>32</h3>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon"><FiUserPlus /></div>
            <div className="kpi-text">
              <p>New Registrations</p>
              <h3>45</h3>
            </div>
          </div>
        </div>

        {/* INTAKE SUMMARY */}
        <div className="intake-container">
          <div className="intake-card">
            <div className="intake-left">
              <div className="intake-icon"><FiUsers /></div>
              <div>
                <h4>Intake 41</h4>
                <h2>1050</h2>
              </div>
            </div>
            <div className="intake-right">
              <div>
                <p>Software Engineering</p>
                <h3>550</h3>
              </div>
              <div>
                <p>Computer Science</p>
                <h3>500</h3>
              </div>
            </div>
          </div>

          <div className="intake-card">
            <div className="intake-left">
              <div className="intake-icon"><FiUsers /></div>
              <div>
                <h4>Intake 40</h4>
                <h2>1420</h2>
              </div>
            </div>
            <div className="intake-right">
              <div>
                <p>Software Engineering</p>
                <h3>720</h3>
              </div>
              <div>
                <p>Computer Science</p>
                <h3>700</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Reusable Footer Component */}
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;