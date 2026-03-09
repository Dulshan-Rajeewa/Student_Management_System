import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from 'react-icons/fi';
import './AuditLogs.css';

const AuditLogs = () => {
  useEffect(() => {
    document.title = "System Audit Logs | KDU SMS";
  }, []);

  // 1. DUMMY DATA STATE (View Only)
  const [logs] = useState([
    { id: 1, date: '2026-01-28', time: '10:00 AM', admin: 'Dulshan', type: 'CREATE', details: 'Registered Student ID D/BSE/24/0001' },
    { id: 2, date: '2026-01-28', time: '10:15 AM', admin: 'Dulshan', type: 'UPDATE', details: 'Modified Student ID D/BSE/24/0002' },
    { id: 3, date: '2026-01-28', time: '03:00 PM', admin: 'Behan', type: 'DELETE', details: 'Deleted Student ID D/BSE/24/0001' },
    { id: 4, date: '2026-01-27', time: '09:30 AM', admin: 'Dulshan', type: 'CREATE', details: 'Registered Student ID D/BCS/24/0014' },
    { id: 5, date: '2026-01-26', time: '11:00 AM', admin: 'Behan', type: 'UPDATE', details: 'Added course SE3032 to Intake 41' },
    { id: 6, date: '2026-01-25', time: '02:00 PM', admin: 'Dulshan', type: 'CREATE', details: 'Registered Student ID D/BSE/24/0015' },
  ]);

  // 2. FILTER STATES
  const [filterDate, setFilterDate] = useState('All');
  const [filterAdmin, setFilterAdmin] = useState('All');

  // 3. PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- LOGIC: FILTERING ---
  const filteredLogs = logs.filter(log => {
    const matchesDate = filterDate === 'All' || log.date === filterDate;
    const matchesAdmin = filterAdmin === 'All' || log.admin === filterAdmin;
    return matchesDate && matchesAdmin;
  });

  // --- LOGIC: PAGINATION ---
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDate, filterAdmin]);

  // Helper function for badge colors
  const getBadgeClass = (type) => {
    switch(type) {
      case 'CREATE': return 'activity-badge create';
      case 'UPDATE': return 'activity-badge update';
      case 'DELETE': return 'activity-badge delete';
      default: return 'activity-badge';
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="audit-header">
          <h1>System Audit Logs</h1>
        </div>

        {/* Dropdown Filters (Matching Figma) */}
        <div className="filter-group">
          <select className="filter-select" value={filterDate} onChange={e => setFilterDate(e.target.value)}>
            <option value="All">🕒 Filter by Date (All)</option>
            <option value="2026-01-28">2026-01-28</option>
            <option value="2026-01-27">2026-01-27</option>
            <option value="2026-01-26">2026-01-26</option>
          </select>

          <select className="filter-select" value={filterAdmin} onChange={e => setFilterAdmin(e.target.value)}>
            <option value="All">👤 Filter by Admin (All)</option>
            <option value="Dulshan">Dulshan</option>
            <option value="Behan">Behan</option>
          </select>
        </div>

        {/* Data Table Area */}
        <div className="table-card">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Administrator</th>
                <th>Activity Type</th>
                <th>Details</th>
                <th></th> {/* Empty header for the more icon */}
              </tr>
            </thead>
            <tbody>
              {currentLogs.length > 0 ? (
                currentLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <strong>{log.date}</strong><br/>
                      <span style={{ fontSize: '12px', color: '#888' }}>{log.time}</span>
                    </td>
                    <td>{log.admin}</td>
                    <td>
                      <span className={getBadgeClass(log.type)}>
                        {log.type}
                      </span>
                    </td>
                    <td>{log.details}</td>
                    <td style={{ textAlign: 'center' }}>
                      <FiMoreHorizontal className="more-icon" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">No audit logs found for the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <span>
              Showing <strong>{currentLogs.length > 0 ? indexOfFirstItem + 1 : 0} - {indexOfFirstItem + currentLogs.length}</strong> from <strong>{filteredLogs.length}</strong> data
            </span>
            <div className="page-numbers">
              <button 
                className="page-num" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <FiChevronLeft />
              </button>
              
              <div className="page-num active">{currentPage}</div>
              
              <button 
                className="page-num" 
                disabled={currentPage === totalPages || totalPages === 0} 
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default AuditLogs;