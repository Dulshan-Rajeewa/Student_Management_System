import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from 'react-icons/fi';
import './AuditLogs.css';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filterDate, setFilterDate] = useState('All');
  const [filterAdmin, setFilterAdmin] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Increased to 8 to show more logs

  // --- FETCH REAL AUDIT LOGS ---
  useEffect(() => {
    document.title = "System Audit Logs | KDU SMS";
    
    const fetchLogs = async () => {
      try {
        const response = await fetch('http://localhost:8083/api/audit');
        if (response.ok) {
          const dbLogs = await response.json();
          
          // Format the data from the database
          const formattedLogs = dbLogs.map(log => {
            const dateObj = new Date(log.timestamp);
            return {
              id: log.log_id,
              date: dateObj.toLocaleDateString('en-CA'), // e.g. 2026-03-14
              time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              admin: log.admin_id,
              type: log.action_type,
              details: log.details
            };
          });
          setLogs(formattedLogs);
        }
      } catch (error) {
        console.error("Error fetching audit logs:", error);
      }
    };

    fetchLogs();
  }, []);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [filterDate, filterAdmin]);

  const getBadgeClass = (type) => {
    switch(type) {
      case 'CREATE': return 'activity-badge create';
      case 'UPDATE': return 'activity-badge update';
      case 'DELETE': return 'activity-badge delete';
      default: return 'activity-badge';
    }
  };

  // Get unique dates and admins for the dropdowns
  const uniqueDates = [...new Set(logs.map(log => log.date))];
  const uniqueAdmins = [...new Set(logs.map(log => log.admin))];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="audit-header">
          <h1>System Audit Logs</h1>
        </div>

        {/* Dropdown Filters */}
        <div className="filter-group">
          <select className="filter-select" value={filterDate} onChange={e => setFilterDate(e.target.value)}>
            <option value="All">🕒 Filter by Date (All)</option>
            {uniqueDates.map(date => <option key={date} value={date}>{date}</option>)}
          </select>

          <select className="filter-select" value={filterAdmin} onChange={e => setFilterAdmin(e.target.value)}>
            <option value="All">👤 Filter by Admin (All)</option>
            {uniqueAdmins.map(admin => <option key={admin} value={admin}>{admin}</option>)}
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
                <th />
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
                    <td><span className={getBadgeClass(log.type)}>{log.type}</span></td>
                    <td>{log.details}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">No audit logs found.</td>
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
              <button className="page-num" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}><FiChevronLeft /></button>
              <div className="page-num active">{currentPage}</div>
              <button className="page-num" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)}><FiChevronRight /></button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default AuditLogs;