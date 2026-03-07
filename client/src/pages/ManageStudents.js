import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { FiSearch, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './ManageStudents.css';

const ManageStudents = () => {
  useEffect(() => {
    document.title = "Manage Students | KDU SMS";
  }, []);

  // 1. DUMMY DATA STATE (We use useState so we can delete items from it)
  const [students, setStudents] = useState([
    { id: 'D/BSE/24/0009', name: 'U.D.Rajeewa', degree: 'BSE', intake: '41', status: 'Active' },
    { id: 'D/BSE/24/0010', name: 'M.P.B.R.Perera', degree: 'BSE', intake: '38', status: 'Graduated' },
    { id: 'D/BSE/24/0011', name: 'I.G.S.B.Rupasignha', degree: 'BSE', intake: '40', status: 'Active' },
    { id: 'D/BSE/24/0012', name: 'I.S.Jayawikrama', degree: 'BSE', intake: '41', status: 'Active' },
    { id: 'D/BSE/24/0013', name: 'L.Aberathna', degree: 'BSE', intake: '41', status: 'Active' },
    { id: 'D/BCS/24/0014', name: 'S.T.Kumara', degree: 'BCS', intake: '42', status: 'Suspended' },
  ]);

  // 2. FILTER & SEARCH STATES
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIntake, setFilterIntake] = useState('All');
  const [filterDegree, setFilterDegree] = useState('All');

  // 3. SELECTION & PAGINATION STATES
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- LOGIC: FILTERING ---
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIntake = filterIntake === 'All' || student.intake === filterIntake;
    const matchesDegree = filterDegree === 'All' || student.degree === filterDegree;
    return matchesSearch && matchesIntake && matchesDegree;
  });

  // --- LOGIC: PAGINATION ---
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterIntake, filterDegree]);

  // --- LOGIC: SELECTION ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(currentStudents.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id)); // Remove
    } else {
      setSelectedIds([...selectedIds, id]); // Add
    }
  };

  // --- LOGIC: ACTIONS ---
  const handleDeleteSingle = (id) => {
    if (window.confirm(`Delete student ${id}?`)) {
      setStudents(students.filter(s => s.id !== id));
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id)); // Deselect if deleted
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} students?`)) {
      setStudents(students.filter(s => !selectedIds.includes(s.id)));
      setSelectedIds([]); // Clear selection
    }
  };

  const handleBulkAction = (actionName) => {
    alert(`${actionName} action triggered for ${selectedIds.length} students:\n${selectedIds.join('\n')}`);
    // Here you would open a modal to select the course/semester, then call the backend.
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="manage-header">
          <h1>Manage Students</h1>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search by Student ID or Name....." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-btn"><FiSearch /></button>
        </div>

        {/* Dropdown Filters */}
        <div className="filter-group">
          <select className="filter-select" value={filterIntake} onChange={e => setFilterIntake(e.target.value)}>
            <option value="All">Filter by Intake (All)</option>
            <option value="38">Intake 38</option>
            <option value="40">Intake 40</option>
            <option value="41">Intake 41</option>
            <option value="42">Intake 42</option>
          </select>

          <select className="filter-select" value={filterDegree} onChange={e => setFilterDegree(e.target.value)}>
            <option value="All">Filter by Degree (All)</option>
            <option value="BSE">Software Eng (BSE)</option>
            <option value="BCS">Computer Sci (BCS)</option>
          </select>
        </div>

        {/* Data Table Area */}
        <div className="table-card">
          
          {/* DYNAMIC BULK ACTIONS BAR (Only shows if students are selected) */}
          {selectedIds.length > 0 && (
            <div className="bulk-actions-bar">
              <span>{selectedIds.length} Student(s) Selected</span>
              <div className="bulk-btn-group">
                <button className="bulk-btn" onClick={() => handleBulkAction("Add Semester")}>+ Add Semester</button>
                <button className="bulk-btn" onClick={() => handleBulkAction("Add Course")}>+ Add Course</button>
                <button className="bulk-btn" onClick={() => handleBulkAction("Edit")}>✎ Edit</button>
                <button className="bulk-btn delete" onClick={handleBulkDelete}>🗑 Delete</button>
              </div>
            </div>
          )}

          <table className="student-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={currentStudents.length > 0 && selectedIds.length === currentStudents.length}
                  />
                </th>
                <th>Student ID</th>
                <th>Name with Initials</th>
                <th>Degree</th>
                <th>Intake</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.length > 0 ? (
                currentStudents.map((student) => (
                  <tr key={student.id} style={{ backgroundColor: selectedIds.includes(student.id) ? '#f8faff' : 'transparent' }}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(student.id)}
                        onChange={() => handleSelectOne(student.id)}
                      />
                    </td>
                    <td><strong>{student.id}</strong></td>
                    <td>{student.name}</td>
                    <td>{student.degree}</td>
                    <td>{student.intake}</td>
                    <td>
                      <span style={{ color: student.status === 'Active' ? '#28a745' : student.status === 'Suspended' ? '#dc3545' : '#6c757d', fontWeight: '500'}}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-icons">
                        <button className="icon-btn" title="Edit Student"><FiEdit2 /></button>
                        <button className="icon-btn delete" title="Remove Student" onClick={() => handleDeleteSingle(student.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">No students found matching your search or filters.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <span>
              Showing <strong>{currentStudents.length > 0 ? indexOfFirstItem + 1 : 0} - {indexOfFirstItem + currentStudents.length}</strong> from <strong>{filteredStudents.length}</strong> data
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

export default ManageStudents;