import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterStudent from './pages/RegisterStudent';

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
        </Routes>
      </div>
    </Router>
  );
}

export default App;