import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { FiSearch, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import './ManageStudents.css';

const ManageStudents = () => {
  useEffect(() => {
    document.title = "Manage Students | KDU SMS";
  }, []);

  // 1. RICH DUMMY DATA STATE
  const [students, setStudents] = useState([
    { 
      id: 'D/BSE/24/0009', name: 'U.D.Rajeewa', degree: 'BSE', intake: '41', status: 'Active',
      address: 'Colombo, Sri Lanka', birthday: '2001-05-12', nationalId: '200112345678',
      currentSemester: 3,
      currentCourses: [
        'SE3032 - Software Construction', 
        'SE3044 - Algorithms & Data Structures',
        'SE3055 - Professional Ethics',
        'SE3099 - Web Technologies'
      ],
      courseHistory: [
        { code: 'SE101 - Intro to Programming', sem: 1 }, 
        { code: 'MA102 - Engineering Math I', sem: 1 }, 
        { code: 'SE201 - Object Oriented Design', sem: 2 },
        { code: 'SE202 - Database Systems', sem: 2 }
      ]
    },
    { 
      id: 'D/BSE/24/0010', name: 'M.P.B.R.Perera', degree: 'BSE', intake: '38', status: 'Graduated',
      address: 'Kandy, Sri Lanka', birthday: '1999-11-20', nationalId: '199912345678',
      currentSemester: 8,
      currentCourses: [],
      courseHistory: [
        { code: 'SE101 - Intro to Programming', sem: 1 }, 
        { code: 'SE701 - Project Management', sem: 7 }, 
        { code: 'SE801 - Final Year Project', sem: 8 }
      ]
    },
    { 
      id: 'D/BCS/24/0014', name: 'S.T.Kumara', degree: 'BCS', intake: '42', status: 'Active',
      address: 'Galle, Sri Lanka', birthday: '2002-03-08', nationalId: '200212345678',
      currentSemester: 1,
      currentCourses: [
        'CS101 - Computer Architecture', 
        'CS102 - Discrete Mathematics'
      ],
      courseHistory: []
    },
  ]);

  // 2. FILTER & SEARCH STATES
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIntake, setFilterIntake] = useState('All');
  const [filterDegree, setFilterDegree] = useState('All');

  // 3. SELECTION & PAGINATION STATES
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 4. MODAL STATES
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  
  const [viewingStudent, setViewingStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  
  // States for Tag Inputs
  const [courseInput, setCourseInput] = useState('');
  const [bulkCourses, setBulkCourses] = useState([]);

  // --- LOGIC: FILTERING & PAGINATION ---
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIntake = filterIntake === 'All' || student.intake === filterIntake;
    const matchesDegree = filterDegree === 'All' || student.degree === filterDegree;
    return matchesSearch && matchesIntake && matchesDegree;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(currentStudents.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSingle = (id) => {
    if (window.confirm(`Delete student ${id}?`)) {
      setStudents(students.filter(s => s.id !== id));
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} students?`)) {
      setStudents(students.filter(s => !selectedIds.includes(s.id)));
      setSelectedIds([]);
    }
  };

  // --- LOGIC: MODALS ---
  const openDetailsModal = (student) => {
    setViewingStudent(student);
    setIsDetailsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent({ ...student, currentCourses: [...student.currentCourses] });
    setIsDetailsModalOpen(false); 
    setIsEditModalOpen(true);
  };

  const saveEditStudent = (e) => {
    e.preventDefault();
    setStudents(students.map(s => (s.id === editingStudent.id ? editingStudent : s)));
    setIsEditModalOpen(false);
    alert(`Student ${editingStudent.id} updated successfully!`);
  };

  // --- LOGIC: COURSE TAGS ---
  const handleCourseKeyDown = (e, stateUpdater, currentList) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newCourse = courseInput.trim(); 
      if (newCourse !== '' && !currentList.includes(newCourse)) {
        stateUpdater([...currentList, newCourse]);
        setCourseInput('');
      }
    }
  };

  const removeCourse = (courseToRemove, stateUpdater, currentList) => {
    stateUpdater(currentList.filter(course => course !== courseToRemove));
  };

  // --- LOGIC: BULK ACTIONS ---
  const saveBulkSemester = (e) => {
    e.preventDefault();
    const updatedStudents = students.map(student => {
      if (selectedIds.includes(student.id)) {
        const newHistory = [...student.courseHistory];
        student.currentCourses.forEach(courseCode => {
          newHistory.push({ code: courseCode, sem: student.currentSemester });
        });
        return {
          ...student,
          currentSemester: student.currentSemester + 1,
          courseHistory: newHistory,
          currentCourses: [...bulkCourses] 
        };
      }
      return student;
    });

    setStudents(updatedStudents);
    setIsSemesterModalOpen(false);
    setBulkCourses([]);
    setSelectedIds([]);
    alert(`Successfully upgraded ${selectedIds.length} students to their next semester!`);
  };

  const saveBulkCourse = (e) => {
    e.preventDefault();
    const updatedStudents = students.map(student => {
      if (selectedIds.includes(student.id)) {
        const uniqueNewCourses = bulkCourses.filter(c => !student.currentCourses.includes(c));
        return {
          ...student,
          currentCourses: [...student.currentCourses, ...uniqueNewCourses]
        };
      }
      return student;
    });

    setStudents(updatedStudents);
    setIsCourseModalOpen(false);
    setBulkCourses([]);
    setSelectedIds([]);
    alert(`Successfully added new courses to ${selectedIds.length} students!`);
  };

  // --- HELPER FUNCTION: Group History By Semester ---
  const getGroupedHistory = (historyArray) => {
    const grouped = {};
    historyArray.forEach(item => {
      if (!grouped[item.sem]) grouped[item.sem] = [];
      grouped[item.sem].push(item.code);
    });
    return grouped;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="manage-header">
          <h1>Manage Students</h1>
        </div>

        <div className="search-container">
          <input type="text" placeholder="Search by Student ID or Name....." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button className="search-btn"><FiSearch /></button>
        </div>

        <div className="filter-group">
          <select className="filter-select" value={filterIntake} onChange={e => setFilterIntake(e.target.value)}>
            <option value="All">Filter by Intake (All)</option>
            <option value="38">Intake 38</option>
            <option value="41">Intake 41</option>
            <option value="42">Intake 42</option>
          </select>
          <select className="filter-select" value={filterDegree} onChange={e => setFilterDegree(e.target.value)}>
            <option value="All">Filter by Degree (All)</option>
            <option value="BSE">Software Eng (BSE)</option>
            <option value="BCS">Computer Sci (BCS)</option>
          </select>
        </div>

        <div className="table-card">
          {selectedIds.length > 0 && (
            <div className="bulk-actions-bar">
              <span>{selectedIds.length} Student(s) Selected</span>
              <div className="bulk-btn-group">
                <button className="bulk-btn" onClick={() => setIsSemesterModalOpen(true)}>+ Next Semester</button>
                <button className="bulk-btn" onClick={() => setIsCourseModalOpen(true)}>+ Add Course</button>
                <button className="bulk-btn delete" onClick={handleBulkDelete}>🗑 Delete</button>
              </div>
            </div>
          )}

          <table className="student-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}><input type="checkbox" onChange={handleSelectAll} checked={currentStudents.length > 0 && selectedIds.length === currentStudents.length} /></th>
                <th>Student ID</th>
                <th>Name with Initials</th>
                <th>Degree</th>
                <th>Intake</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student) => (
                <tr key={student.id} style={{ backgroundColor: selectedIds.includes(student.id) ? '#f8faff' : 'transparent' }}>
                  <td><input type="checkbox" checked={selectedIds.includes(student.id)} onChange={() => handleSelectOne(student.id)} /></td>
                  <td><strong>{student.id}</strong></td>
                  <td onClick={() => openDetailsModal(student)} className="clickable-name" title="View Details">{student.name}</td>
                  <td>{student.degree}</td>
                  <td>{student.intake}</td>
                  <td><span style={{ color: student.status === 'Active' ? '#28a745' : '#dc3545', fontWeight: '500'}}>{student.status}</span></td>
                  <td>
                    <div className="action-icons">
                      <button className="icon-btn" title="Edit Student" onClick={() => openEditModal(student)}><FiEdit2 /></button>
                      <button className="icon-btn delete" title="Remove Student" onClick={() => handleDeleteSingle(student.id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Footer />
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. VIEW STUDENT DETAILS MODAL */}
      {isDetailsModalOpen && viewingStudent && (
        <div className="modal-overlay">
          <div className="modal-box large">
            <div className="modal-header">
              <h2>Student Profile</h2>
              <button className="close-btn" onClick={() => setIsDetailsModalOpen(false)}><FiX /></button>
            </div>
            
            <div className="modal-body-split">
              <div className="modal-left">
                <h3 className="modal-section-title">Personal Information</h3>
                <div className="details-grid">
                  <div className="detail-item"><label>Student ID</label><p>{viewingStudent.id}</p></div>
                  <div className="detail-item"><label>Full Name</label><p>{viewingStudent.name}</p></div>
                  <div className="detail-item"><label>NIC Number</label><p>{viewingStudent.nationalId}</p></div>
                  <div className="detail-item"><label>Birthday</label><p>{viewingStudent.birthday}</p></div>
                  <div className="detail-item" style={{ gridColumn: '1 / -1' }}><label>Address</label><p>{viewingStudent.address}</p></div>
                  <div className="detail-item"><label>Degree</label><p>{viewingStudent.degree}</p></div>
                  <div className="detail-item"><label>Intake</label><p>Intake {viewingStudent.intake}</p></div>
                  <div className="detail-item"><label>Status</label><p style={{ color: viewingStudent.status === 'Active' ? '#28a745' : '#dc3545' }}>{viewingStudent.status}</p></div>
                </div>
              </div>

              <div className="modal-right">
                <h3 className="modal-section-title">Academic Record</h3>
                <div className="course-history-section">
                  <h3 style={{ fontSize: '15px', color: '#333' }}>Current: Semester {viewingStudent.currentSemester}</h3>
                  <label style={{ fontSize: '12px', color: '#888', fontWeight: '600', textTransform: 'uppercase' }}>Enrolled Modules ({viewingStudent.currentCourses.length})</label>
                  <div className="course-tags-container" style={{ marginBottom: '25px' }}>
                    {viewingStudent.currentCourses.length > 0 ? viewingStudent.currentCourses.map(c => (
                      <span key={c} className="course-tag">{c}</span>
                    )) : <span style={{ fontSize: '13px', color: '#999' }}>No current modules.</span>}
                  </div>

                  <label style={{ fontSize: '12px', color: '#888', fontWeight: '600', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }}>Module History (Uneditable)</label>
                  <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                    {viewingStudent.courseHistory.length > 0 ? (
                      Object.entries(getGroupedHistory(viewingStudent.courseHistory))
                        .sort(([semA], [semB]) => Number(semB) - Number(semA)) // Sort newest semester first
                        .map(([sem, courses]) => (
                          <div key={sem} className="history-semester-group">
                            <div className="history-semester-title">Semester {sem}</div>
                            <ul className="history-list">
                              {courses.map((code, index) => (
                                <li key={index}>{code}</li>
                              ))}
                            </ul>
                          </div>
                        ))
                    ) : <span style={{ fontSize: '13px', color: '#999' }}>No previous history found.</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '20px' }}>
              <button className="btn-cancel" onClick={() => setIsDetailsModalOpen(false)}>Close</button>
              <button className="btn-save" onClick={() => openEditModal(viewingStudent)}>✎ Edit Details</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT STUDENT MODAL */}
      {isEditModalOpen && editingStudent && (
        <div className="modal-overlay">
          <div className="modal-box large">
            <div className="modal-header">
              <h2>Edit Student</h2>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}><FiX /></button>
            </div>
            
            <form onSubmit={saveEditStudent}>
              <div className="modal-body-split">
                <div className="modal-left">
                  <h3 className="modal-section-title">Personal Information</h3>
                  <div className="input-group">
                    <label>Student ID (Uneditable)</label>
                    <input type="text" value={editingStudent.id} disabled style={{ background: '#f5f5f5' }} />
                  </div>
                  <div className="modal-row">
                    <div className="input-group"><label>Name</label><input type="text" value={editingStudent.name} onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})} required /></div>
                    <div className="input-group"><label>NIC</label><input type="text" value={editingStudent.nationalId} onChange={(e) => setEditingStudent({...editingStudent, nationalId: e.target.value})} required /></div>
                  </div>
                  <div className="input-group"><label>Address</label><input type="text" value={editingStudent.address} onChange={(e) => setEditingStudent({...editingStudent, address: e.target.value})} required /></div>
                  <div className="modal-row">
                    <div className="input-group">
                      <label>Degree</label>
                      <select value={editingStudent.degree} onChange={(e) => setEditingStudent({...editingStudent, degree: e.target.value})}>
                        <option value="BSE">BSE</option>
                        <option value="BCS">BCS</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Status</label>
                      <select value={editingStudent.status} onChange={(e) => setEditingStudent({...editingStudent, status: e.target.value})}>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Graduated">Graduated</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-right">
                  <h3 className="modal-section-title">Academic Record</h3>
                  <div className="course-history-section">
                    <h3 style={{ fontSize: '15px', color: '#333' }}>Current: Semester {editingStudent.currentSemester}</h3>
                    
                    <div className="input-group" style={{ marginBottom: 10 }}>
                      <label>Add/Remove Current Modules</label>
                      <input type="text" placeholder="e.g. SE3032 - Software Construction (Press Enter)" value={courseInput} onChange={e => setCourseInput(e.target.value)} onKeyDown={(e) => handleCourseKeyDown(e, (newList) => setEditingStudent({...editingStudent, currentCourses: newList}), editingStudent.currentCourses)} />
                    </div>
                    <div className="course-tags-container" style={{ marginBottom: '25px' }}>
                      {editingStudent.currentCourses.map(course => (
                        <div key={course} className="course-tag">{course} <button type="button" onClick={() => removeCourse(course, (newList) => setEditingStudent({...editingStudent, currentCourses: newList}), editingStudent.currentCourses)}>✕</button></div>
                      ))}
                    </div>

                    <label style={{ fontSize: '12px', color: '#888', fontWeight: '600', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }}>Module History (Uneditable)</label>
                    <div style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '5px' }}>
                      {editingStudent.courseHistory.length > 0 ? (
                        Object.entries(getGroupedHistory(editingStudent.courseHistory))
                          .sort(([semA], [semB]) => Number(semB) - Number(semA))
                          .map(([sem, courses]) => (
                            <div key={sem} className="history-semester-group">
                              <div className="history-semester-title">Semester {sem}</div>
                              <ul className="history-list">
                                {courses.map((code, index) => (
                                  <li key={index} style={{ background: 'transparent' }}>{code}</li>
                                ))}
                              </ul>
                            </div>
                          ))
                      ) : <span style={{ fontSize: '13px', color: '#999' }}>No previous history found.</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions" style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '20px' }}>
                <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. BULK ADD COURSE MODAL */}
      {isCourseModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box mini">
            <div className="modal-header">
              <h2>Add Course to {selectedIds.length} Student(s)</h2>
              <button className="close-btn" onClick={() => setIsCourseModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={saveBulkCourse}>
              <div className="input-group">
                <label>Enter Course Codes & Names (Press Enter)</label>
                <input type="text" placeholder="e.g. SE3032 - Software Construction" value={courseInput} onChange={e => setCourseInput(e.target.value)} onKeyDown={(e) => handleCourseKeyDown(e, setBulkCourses, bulkCourses)} />
                <div className="course-tags-container">
                  {bulkCourses.map(course => (
                    <div key={course} className="course-tag">{course} <button type="button" onClick={() => removeCourse(course, setBulkCourses, bulkCourses)}>✕</button></div>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => { setIsCourseModalOpen(false); setBulkCourses([]); }}>Cancel</button>
                <button type="submit" className="btn-save">Enroll Students</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. BULK NEXT SEMESTER MODAL */}
      {isSemesterModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box mini">
            <div className="modal-header">
              <h2>Upgrade Semester</h2>
              <button className="close-btn" onClick={() => setIsSemesterModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={saveBulkSemester}>
              <p style={{ fontSize: '14px', color: '#555', marginBottom: '20px' }}>
                You are about to upgrade <strong>{selectedIds.length}</strong> student(s) to their next semesters. Old modules will be moved to History.
              </p>
              
              <div className="input-group">
                <label>Enter New Modules (Press Enter)</label>
                <input type="text" placeholder="e.g. SE4000 - Architecture" value={courseInput} onChange={e => setCourseInput(e.target.value)} onKeyDown={(e) => handleCourseKeyDown(e, setBulkCourses, bulkCourses)} />
                <div className="course-tags-container">
                  {bulkCourses.map(course => (
                    <div key={course} className="course-tag">{course} <button type="button" onClick={() => removeCourse(course, setBulkCourses, bulkCourses)}>✕</button></div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => { setIsSemesterModalOpen(false); setBulkCourses([]); }}>Cancel</button>
                <button type="submit" className="btn-save">Confirm Upgrade</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageStudents;