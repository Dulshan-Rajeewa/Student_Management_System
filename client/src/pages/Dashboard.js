import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { FiUsers, FiAward, FiBookOpen, FiUserPlus } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  // 1. STATE FOR REAL-TIME DATA
  const [adminName, setAdminName] = useState('Administrator');
  const [totalCourses, setTotalCourses] = useState(0);
  const [students, setStudents] = useState([]);

  // 2. FETCH DATA ON LOAD
  useEffect(() => {
    document.title = "Dashboard | KDU SMS";
    
    // Get Admin Name from LocalStorage (from our Mock Login)
    const savedAdmin = localStorage.getItem('currentAdmin');
    if (savedAdmin) {
      setAdminName(JSON.parse(savedAdmin).name);
    }

    // Fetch Students and Courses simultaneously
    const fetchDashboardData = async () => {
      try {
        const [studentsRes, coursesRes] = await Promise.all([
          fetch('http://localhost:8081/api/students'),
          fetch('http://localhost:8082/api/courses')
        ]);

        if (studentsRes.ok) {
          const studentData = await studentsRes.json();
          setStudents(studentData);
        }

        if (coursesRes.ok) {
          const courseData = await coursesRes.json();
          setTotalCourses(courseData.length);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // 3. CALCULATE KPIs DYNAMICALLY
  const totalStudents = students.length;
  
  // Create a Set to count unique degree programs (e.g. BSE, BCS)
  const uniqueDegreesCount = new Set(students.map(s => s.degree)).size;
  
  // Let's assume "New Registrations" are students currently in Semester 1
  const newRegistrations = students.filter(s => s.current_semester === 1).length;

  // 4. GROUP DATA BY INTAKE FOR THE SUMMARY CARDS
  // This turns a flat list of students into an organized object
  const intakesData = students.reduce((acc, student) => {
    const intake = student.intake;
    const degree = student.degree;

    if (!acc[intake]) {
      acc[intake] = { total: 0, degrees: {} };
    }
    
    acc[intake].total += 1;
    
    if (!acc[intake].degrees[degree]) {
      acc[intake].degrees[degree] = 0;
    }
    acc[intake].degrees[degree] += 1;

    return acc;
  }, {});

  // Convert the object back into an array and sort by Intake (e.g. 42, 41, 40)
  const intakeArray = Object.keys(intakesData)
    .map(key => ({
      intakeNumber: key,
      ...intakesData[key]
    }))
    .sort((a, b) => b.intakeNumber - a.intakeNumber);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="main-content">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <h2>Welcome, {adminName}</h2>
        </div>

        {/* KPI SECTION */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon"><FiUsers /></div>
            <div className="kpi-text">
              <p>Total Students</p>
              <h3>{totalStudents}</h3>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon"><FiAward /></div>
            <div className="kpi-text">
              <p>Degree Programs</p>
              {/* Shows 0 if no students, otherwise shows real count */}
              <h3>{totalStudents === 0 ? 0 : uniqueDegreesCount}</h3>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon"><FiBookOpen /></div>
            <div className="kpi-text">
              <p>Active Courses</p>
              <h3>{totalCourses}</h3>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon"><FiUserPlus /></div>
            <div className="kpi-text">
              <p>New Registrations</p>
              <h3>{newRegistrations}</h3>
            </div>
          </div>
        </div>

        {/* DYNAMIC INTAKE SUMMARY */}
        <div className="intake-container">
          {intakeArray.length > 0 ? (
            intakeArray.map(intake => (
              <div className="intake-card" key={intake.intakeNumber}>
                <div className="intake-left">
                  <div className="intake-icon"><FiUsers /></div>
                  <div>
                    <h4>Intake {intake.intakeNumber}</h4>
                    <h2>{intake.total}</h2>
                  </div>
                </div>
                <div className="intake-right">
                  {/* Loop through the specific degrees inside this intake */}
                  {Object.entries(intake.degrees).map(([degreeName, count]) => (
                    <div key={degreeName}>
                      <p>{degreeName}</p>
                      <h3>{count}</h3>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Fallback empty state if there are no students in the database yet
            <div className="intake-card" style={{ justifyContent: 'center', color: '#888' }}>
              <p>No student intake data available yet.</p>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;