import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterStudent from './pages/RegisterStudent';
import ManageStudents from './pages/ManageStudents';
import Courses from './pages/Courses';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import Support from './pages/Support';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route is the Login page */}
          <Route path="/" element={<Login />} />
          
          {/* Dashboard route */}
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/register" element={<RegisterStudent />} />

          <Route path="/students" element={<ManageStudents />} />
          
          <Route path="/courses" element={<Courses />} />

          <Route path="/audit" element={<AuditLogs />} />

          <Route path="/settings" element={<Settings />} />

          <Route path="/support" element={<Support />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;