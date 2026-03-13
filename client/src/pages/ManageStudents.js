import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { FiSearch, FiEdit2, FiTrash2, FiX, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import './ManageStudents.css';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]); // Real courses for datalist
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIntake, setFilterIntake] = useState('All');
  const [filterDegree, setFilterDegree] = useState('All');

  const [selectedIds, setSelectedIds] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Triggers re-fetch after saving

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  
  const [viewingStudent, setViewingStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  
  const [courseInput, setCourseInput] = useState('');
  const [bulkCourses, setBulkCourses] = useState([]);
  
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({ isOpen: false, uuid: null, studentId: null });
  const [messageDialog, setMessageDialog] = useState({ isOpen: false, message: '', type: 'success' });

  const showMessage = (msg, type = "success") => setMessageDialog({ isOpen: true, message: msg, type });
  const triggerRefetch = () => setRefreshTrigger(prev => prev + 1);

  // --- FETCH DATA ON LOAD & REFRESH ---
  useEffect(() => {
    document.title = "Manage Students | KDU SMS";
    
    // Fetch Students
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/students');
        if (response.ok) {
          const data = await response.json();
          const formattedData = data.map(dbStudent => {
            const currentSem = dbStudent.current_semester || 1;
            const enrollments = dbStudent.enrollments || [];
            return {
              uuid: dbStudent.uuid, 
              id: dbStudent.id, 
              name: `${dbStudent.first_name} ${dbStudent.last_name}`,
              degree: dbStudent.degree,
              intake: dbStudent.intake,
              status: dbStudent.status,
              address: dbStudent.address || 'N/A',
              birthday: dbStudent.birthday ? dbStudent.birthday.split('T')[0] : 'N/A',
              nationalId: 'N/A', 
              currentSemester: currentSem,
              currentCourses: enrollments.filter(e => e.sem === currentSem).map(e => `${e.code} - ${e.name}`),
              courseHistory: enrollments.filter(e => e.sem < currentSem)
            };
          });
          setStudents(formattedData);
        }
      } catch (err) { console.error(err); }
    };

    // Fetch Courses (for the search/datalist)
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:8082/api/courses');
        if (response.ok) setAvailableCourses(await response.json());
      } catch (err) { console.error(err); }
    };

    fetchStudents();
    fetchCourses();
  }, [refreshTrigger]); // Will re-run when refreshTrigger changes

  // --- FILTERING (SHOWS ALL STUDENTS, NO PAGINATION) ---
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIntake = filterIntake === 'All' || student.intake === filterIntake;
    const matchesDegree = filterDegree === 'All' || student.degree === filterDegree;
    return matchesSearch && matchesIntake && matchesDegree;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(filteredStudents.map(s => s.uuid));
    else setSelectedIds([]);
  };

  const handleSelectOne = (uuid) => {
    if (selectedIds.includes(uuid)) setSelectedIds(selectedIds.filter(id => id !== uuid));
    else setSelectedIds([...selectedIds, uuid]);
  };

  // --- DELETE LOGIC ---
  const initiateDelete = (uuid, studentId) => setConfirmDeleteDialog({ isOpen: true, uuid, studentId });

  const executeDeleteStudent = async () => {
    const { uuid, studentId } = confirmDeleteDialog;
    try {
      const res = await fetch(`http://localhost:8081/api/students/${uuid}`, { method: 'DELETE' });
      if (res.ok) {
        triggerRefetch();
        setConfirmDeleteDialog({ isOpen: false, uuid: null, studentId: null });
        showMessage(`Student ${studentId} removed from system.`, "success");
      }
    } catch (err) { showMessage("Error removing student.", "error"); }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to completely remove ${selectedIds.length} students?`)) {
      try {
        for (const uuid of selectedIds) {
          await fetch(`http://localhost:8081/api/students/${uuid}`, { method: 'DELETE' });
        }
        triggerRefetch();
        setSelectedIds([]);
        showMessage(`Successfully deleted ${selectedIds.length} students.`, "success");
      } catch (err) { showMessage("Error during bulk delete.", "error"); }
    }
  };

  // --- MODAL TOGGLES ---
  const openDetailsModal = (student) => { setViewingStudent(student); setIsDetailsModalOpen(true); };
  const openEditModal = (student) => {
    setEditingStudent({ ...student, currentCourses: [...student.currentCourses] });
    setIsDetailsModalOpen(false); setIsEditModalOpen(true);
  };

  // --- COURSE DATALIST LOGIC ---
  const handleCourseKeyDown = (e, stateUpdater, currentList) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = courseInput.trim().toUpperCase();
      // Search database courses
      const courseExists = availableCourses.find(c => c.course_code.toUpperCase() === input || c.course_code.toUpperCase() === input.split(' - ')[0].toUpperCase());

      if (courseExists) {
        const fullCourseString = `${courseExists.course_code} - ${courseExists.course_name}`;
        if (!currentList.includes(fullCourseString)) {
          stateUpdater([...currentList, fullCourseString]);
        }
        setCourseInput('');
      } else {
        showMessage(`Course code not found. Please check active courses.`, 'error');
      }
    }
  };
  const removeCourse = (courseToRemove, stateUpdater, currentList) => stateUpdater(currentList.filter(c => c !== courseToRemove));

  // --- DATABASE UPDATE FUNCTIONS ---
  const saveEditStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8081/api/students/${editingStudent.uuid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingStudent.name,
          address: editingStudent.address,
          status: editingStudent.status,
          currentCourses: editingStudent.currentCourses // Sends array to backend
        })
      });
      if (res.ok) {
        triggerRefetch();
        setIsEditModalOpen(false);
        showMessage("Student details updated successfully!", "success");
      } else showMessage("Failed to update student.", "error");
    } catch (err) { showMessage("Server Error", "error"); }
  };

  const saveBulkSemester = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8081/api/students/bulk-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedIds, courses: bulkCourses })
      });
      if (res.ok) {
        triggerRefetch();
        setIsSemesterModalOpen(false); setBulkCourses([]); setSelectedIds([]);
        showMessage(`Upgraded ${selectedIds.length} students to next semester!`, "success");
      }
    } catch (err) { showMessage("Server Error", "error"); }
  };

  const saveBulkCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8081/api/students/bulk-enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedIds, courses: bulkCourses })
      });
      if (res.ok) {
        triggerRefetch();
        setIsCourseModalOpen(false); setBulkCourses([]); setSelectedIds([]);
        showMessage(`Added courses to ${selectedIds.length} students!`, "success");
      }
    } catch (err) { showMessage("Server Error", "error"); }
  };

  const getGroupedHistory = (historyArray) => {
    const grouped = {};
    historyArray.forEach(item => {
      if (!grouped[item.sem]) grouped[item.sem] = [];
      grouped[item.sem].push(`${item.code} - ${item.name}`);
    });
    return grouped;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="manage-header"><h1>Manage Students</h1></div>

        <div className="search-container">
          <input type="text" placeholder="Search by Student ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button className="search-btn"><FiSearch /></button>
        </div>

        <div className="filter-group">
          <select className="filter-select" value={filterIntake} onChange={e => setFilterIntake(e.target.value)}>
            <option value="All">Filter Intake (All)</option>
            <option value="39">Intake 39</option><option value="40">Intake 40</option>
            <option value="41">Intake 41</option><option value="42">Intake 42</option><option value="43">Intake 43</option>
          </select>
          <select className="filter-select" value={filterDegree} onChange={e => setFilterDegree(e.target.value)}>
            <option value="All">Filter Degree (All)</option>
            <option value="BSE">BSE</option><option value="BCS">BCS</option>
            <option value="IT">IT</option><option value="IS">IS</option>
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
                <th style={{ width: '40px' }}><input type="checkbox" onChange={handleSelectAll} checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length} /></th>
                <th>Student ID</th>
                <th>Name</th>
                <th>Degree</th>
                <th>Intake</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.uuid} style={{ backgroundColor: selectedIds.includes(student.uuid) ? '#f8faff' : 'transparent' }}>
                  <td><input type="checkbox" checked={selectedIds.includes(student.uuid)} onChange={() => handleSelectOne(student.uuid)} /></td>
                  <td><strong>{student.id}</strong></td>
                  <td onClick={() => openDetailsModal(student)} className="clickable-name">{student.name}</td>
                  <td>{student.degree}</td>
                  <td>{student.intake}</td>
                  <td><span style={{ color: student.status === 'Active' ? '#28a745' : '#dc3545', fontWeight: '500'}}>{student.status}</span></td>
                  <td>
                    <div className="action-icons">
                      <button className="icon-btn" onClick={() => openEditModal(student)}><FiEdit2 /></button>
                      <button className="icon-btn delete" onClick={() => initiateDelete(student.uuid, student.id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && <tr><td colSpan="7" className="empty-state">No students found.</td></tr>}
            </tbody>
          </table>
        </div>
        <Footer />
      </div>

      {/* REUSABLE DATALIST FOR ALL MODALS */}
      <datalist id="db-courses">
        {availableCourses.map(course => (
          <option key={course.id} value={course.course_code}>{course.course_name}</option>
        ))}
      </datalist>

      {/* 1. VIEW STUDENT MODAL */}
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
                  <div className="detail-item"><label>Birthday</label><p>{viewingStudent.birthday}</p></div>
                  <div className="detail-item" style={{ gridColumn: '1 / -1' }}><label>Address</label><p>{viewingStudent.address}</p></div>
                  <div className="detail-item"><label>Degree</label><p>{viewingStudent.degree}</p></div>
                  <div className="detail-item"><label>Intake</label><p>Intake {viewingStudent.intake}</p></div>
                </div>
              </div>
              <div className="modal-right">
                <h3 className="modal-section-title">Academic Record</h3>
                <div className="course-history-section">
                  <h3 style={{ fontSize: '15px' }}>Current: Semester {viewingStudent.currentSemester}</h3>
                  <div className="course-tags-container" style={{ marginBottom: '25px' }}>
                    {viewingStudent.currentCourses.length > 0 ? viewingStudent.currentCourses.map(c => <span key={c} className="course-tag">{c}</span>) : <span style={{ fontSize: '13px', color: '#999' }}>No modules.</span>}
                  </div>
                  <label style={{ fontSize: '12px', fontWeight: '600' }}>Module History</label>
                  <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    {viewingStudent.courseHistory.length > 0 ? (
                      Object.entries(getGroupedHistory(viewingStudent.courseHistory)).sort(([semA], [semB]) => Number(semB) - Number(semA)).map(([sem, courses]) => (
                        <div key={sem} className="history-semester-group">
                          <div className="history-semester-title">Semester {sem}</div>
                          <ul className="history-list">{courses.map((code, index) => <li key={index}>{code}</li>)}</ul>
                        </div>
                      ))
                    ) : <span style={{ fontSize: '13px', color: '#999' }}>No history.</span>}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions"><button className="btn-cancel" onClick={() => setIsDetailsModalOpen(false)}>Close</button><button className="btn-save" onClick={() => openEditModal(viewingStudent)}>Edit Details</button></div>
          </div>
        </div>
      )}

      {/* 2. EDIT STUDENT MODAL */}
      {isEditModalOpen && editingStudent && (
        <div className="modal-overlay">
          <div className="modal-box large">
            <div className="modal-header"><h2>Edit Student</h2><button className="close-btn" onClick={() => setIsEditModalOpen(false)}><FiX /></button></div>
            <form onSubmit={saveEditStudent}>
              <div className="modal-body-split">
                <div className="modal-left">
                  <h3 className="modal-section-title">Personal Information</h3>
                  <div className="input-group"><label>Student ID</label><input type="text" value={editingStudent.id} disabled /></div>
                  <div className="input-group"><label>Name</label><input type="text" value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} /></div>
                  <div className="input-group"><label>Address</label><input type="text" value={editingStudent.address} onChange={e => setEditingStudent({...editingStudent, address: e.target.value})} /></div>
                  <div className="input-group"><label>Status</label><select value={editingStudent.status} onChange={e => setEditingStudent({...editingStudent, status: e.target.value})}><option value="Active">Active</option><option value="Suspended">Suspended</option><option value="Graduated">Graduated</option></select></div>
                </div>
                <div className="modal-right">
                  <h3 className="modal-section-title">Current Modules (Sem {editingStudent.currentSemester})</h3>
                  {/* Using DataList here! */}
                  <input type="text" list="db-courses" className="input-group" placeholder="Type module code (Press Enter)" value={courseInput} onChange={e => setCourseInput(e.target.value)} onKeyDown={e => handleCourseKeyDown(e, (list) => setEditingStudent({...editingStudent, currentCourses: list}), editingStudent.currentCourses)} />
                  <div className="course-tags-container">
                    {editingStudent.currentCourses.map(course => <div key={course} className="course-tag">{course} <button type="button" onClick={() => removeCourse(course, (list) => setEditingStudent({...editingStudent, currentCourses: list}), editingStudent.currentCourses)}>✕</button></div>)}
                  </div>
                </div>
              </div>
              <div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Cancel</button><button type="submit" className="btn-save">Save Changes</button></div>
            </form>
          </div>
        </div>
      )}

      {/* 3. BULK ADD COURSE MODAL */}
      {isCourseModalOpen && (
        <div className="modal-overlay"><div className="modal-box mini"><div className="modal-header"><h2>Add Course to {selectedIds.length} Student(s)</h2><button className="close-btn" onClick={() => setIsCourseModalOpen(false)}><FiX /></button></div><form onSubmit={saveBulkCourse}><div className="input-group"><label>Search Course (Press Enter)</label><input type="text" list="db-courses" value={courseInput} onChange={e => setCourseInput(e.target.value)} onKeyDown={(e) => handleCourseKeyDown(e, setBulkCourses, bulkCourses)} /><div className="course-tags-container">{bulkCourses.map(course => (<div key={course} className="course-tag">{course} <button type="button" onClick={() => removeCourse(course, setBulkCourses, bulkCourses)}>✕</button></div>))}</div></div><div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => { setIsCourseModalOpen(false); setBulkCourses([]); }}>Cancel</button><button type="submit" className="btn-save">Enroll</button></div></form></div></div>
      )}

      {/* 4. BULK NEXT SEMESTER MODAL */}
      {isSemesterModalOpen && (
        <div className="modal-overlay"><div className="modal-box mini"><div className="modal-header"><h2>Upgrade Semester</h2><button className="close-btn" onClick={() => setIsSemesterModalOpen(false)}><FiX /></button></div><form onSubmit={saveBulkSemester}><div className="input-group"><label>Search New Modules (Press Enter)</label><input type="text" list="db-courses" value={courseInput} onChange={e => setCourseInput(e.target.value)} onKeyDown={(e) => handleCourseKeyDown(e, setBulkCourses, bulkCourses)} /><div className="course-tags-container">{bulkCourses.map(course => (<div key={course} className="course-tag">{course} <button type="button" onClick={() => removeCourse(course, setBulkCourses, bulkCourses)}>✕</button></div>))}</div></div><div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => { setIsSemesterModalOpen(false); setBulkCourses([]); }}>Cancel</button><button type="submit" className="btn-save">Confirm Upgrade</button></div></form></div></div>
      )}

      {/* CONFIRM/MESSAGE MODALS */}
      {confirmDeleteDialog.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}><div className="modal-box small"><FiAlertTriangle className="modal-message-icon error" /><h2>Confirm Deletion</h2><p>Remove <strong>{confirmDeleteDialog.studentId}</strong> permanently?</p><div className="modal-actions" style={{justifyContent:'center'}}><button className="btn-cancel" onClick={() => setConfirmDeleteDialog({ isOpen: false, uuid: null, studentId: null })}>Cancel</button><button className="btn-danger" onClick={executeDeleteStudent}>Delete</button></div></div></div>
      )}
      {messageDialog.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}><div className="modal-box small">{messageDialog.type === 'success' ? <FiCheckCircle className="modal-message-icon success" /> : <FiAlertTriangle className="modal-message-icon error" />}<h2>{messageDialog.type === 'success' ? 'Success' : 'Error'}</h2><p>{messageDialog.message}</p><div className="modal-actions" style={{justifyContent:'center'}}><button className="btn-save" onClick={() => setMessageDialog({ isOpen: false, message: '', type: 'success' })}>OK</button></div></div></div>
      )}
    </div>
  );
};

export default ManageStudents;