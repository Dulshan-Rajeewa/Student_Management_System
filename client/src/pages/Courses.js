import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiCheckCircle, FiAlertTriangle, FiInfo } from "react-icons/fi";
import './Courses.css';
import { logActivity } from '../utils/auditLogger';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch real data from the Backend when the page loads
  useEffect(() => {
    document.title = "Manage Courses | KDU SMS";
    
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:8082/api/courses');
        if (response.ok) {
          const dbData = await response.json();
          
          const formattedCourses = dbData.map(dbCourse => ({
            id: dbCourse.id,
            code: dbCourse.course_code,     
            name: dbCourse.course_name,     
            credits: dbCourse.credits,
            description: dbCourse.description,
            enrolled: dbCourse.enrolled_count || 0 
          }));

          setCourses(formattedCourses); 
        } else {
          showMessage("Failed to fetch courses from backend", "error");
        }
      } catch (error) {
        console.error("Error connecting to server:", error);
      }
    };

    fetchCourses();
  }, []);

  // --- MODAL STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({ isOpen: false, id: null, code: null });
  const [messageDialog, setMessageDialog] = useState({ isOpen: false, message: '', type: 'success' });
  
  const [formData, setFormData] = useState({
    id: '', code: '', name: '', credits: '', description: '', enrolled: 0
  });

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showMessage = (msg, type = "success") => {
    setMessageDialog({ isOpen: true, message: msg, type: type });
  };

  // --- ADD COURSE LOGIC ---
  const openAddModal = () => {
    setFormData({ id: '', code: '', name: '', credits: '', description: '', enrolled: 0 });
    setIsAddModalOpen(true);
  };

  const handleSaveNewCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8082/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_code: formData.code,
          course_name: formData.name,
          description: formData.description,
          credits: parseInt(formData.credits)
        }),
      });

      if (response.ok) {
        const savedCourse = await response.json();
        setCourses([...courses, {
            id: savedCourse.id,
            code: savedCourse.code,
            name: savedCourse.name,
            description: savedCourse.description,
            credits: savedCourse.credits,
            enrolled: savedCourse.enrolled_count
        }]);
        setIsAddModalOpen(false);
        showMessage(`Course ${savedCourse.code} added successfully!`, "success");
        logActivity('CREATE', 'COURSE', savedCourse.code, `Created new course: ${savedCourse.name}`);
      } else {
        showMessage("Failed to save course to database.", "error");
      }
    } catch (error) {
      console.error("Error saving course:", error);
      showMessage("Server error while saving course.", "error");
    }
  };

  // --- EDIT COURSE LOGIC ---
  const openEditModal = (course) => {
    setFormData({ ...course });
    setIsEditModalOpen(true);
  };

  const handleSaveEditCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8082/api/courses/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_code: formData.code,
          course_name: formData.name,
          description: formData.description,
          credits: parseInt(formData.credits)
        })
      });

      if (response.ok) {
        setCourses(courses.map(c => (c.id === formData.id ? formData : c)));
        setIsEditModalOpen(false);
        showMessage(`Course ${formData.code} updated successfully!`, "success");
        logActivity('UPDATE', 'COURSE', formData.code, `Updated course details for ${formData.name}`);
      } else {
        showMessage("Failed to update course in database.", "error");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      showMessage("Server error while updating course.", "error");
    }
  };

  // --- DELETE COURSE LOGIC ---
  const initiateDelete = (id, code) => {
    setConfirmDeleteDialog({ isOpen: true, id, code });
  };

  const executeDeleteCourse = async () => {
    const { id, code } = confirmDeleteDialog;
    
    try {
      const response = await fetch(`http://localhost:8082/api/courses/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCourses(courses.filter(c => c.id !== id));
        setConfirmDeleteDialog({ isOpen: false, id: null, code: null });
        showMessage(`Course ${code} removed successfully!`, "success");
        logActivity('DELETE', 'COURSE', code, `Permanently deleted course ${code}`);
      } else {
        setConfirmDeleteDialog({ isOpen: false, id: null, code: null });
        showMessage("Failed to delete course from database.", "error");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      setConfirmDeleteDialog({ isOpen: false, id: null, code: null });
      showMessage("Server error while deleting course.", "error");
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="courses-header">
          <h1>Courses</h1>
        </div>

        <div className="courses-top-bar">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Enter Course ID or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn"><FiSearch /></button>
          </div>
        </div>

        <div className="section-header">
          <h2 className="section-title">Active Courses</h2>
          <button className="add-course-toggle" onClick={openAddModal}>
            <FiPlus size={20} />
            <span>Add New Course</span>
          </button>
        </div>

        <div className="courses-grid">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div className="course-card" key={course.id}>
                
                <div className="course-info">
                  <div className="course-details">
                    <h3>{course.code}</h3>
                    <p>{course.name}</p>
                    <span style={{ fontSize: '12px', color: '#888', marginTop: '4px', display: 'block' }}>
                      {course.credits} Credits
                    </span>
                  </div>
                  
                  <div className="course-credits" title="Current Enrollment">
                    <span className="credits-label">Enrolled</span>
                    <span className="credits-number">{course.enrolled}</span>
                  </div>
                </div>

                <div className="course-actions">
                  <button 
                    className="card-icon-btn edit" 
                    title="Edit Course"
                    onClick={() => openEditModal(course)}
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    className="card-icon-btn delete" 
                    title="Remove Course"
                    onClick={() => initiateDelete(course.id, course.code)}
                  >
                    <FiTrash2 />
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="empty-state">
              No courses found matching "{searchTerm}"
            </div>
          )}
        </div>

        <Footer />
      </div>

      {/* ================= ADD COURSE MODAL ================= */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Add New Course</h2>
              <button className="close-btn" onClick={() => setIsAddModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSaveNewCourse}>
              <div className="modal-row">
                <div className="input-group">
                  <label>Course Code</label>
                  <input type="text" placeholder="e.g. SE4000" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Credits</label>
                  <input type="number" min="1" max="8" placeholder="e.g. 3" value={formData.credits} onChange={(e) => setFormData({...formData, credits: e.target.value})} required />
                </div>
              </div>
              <div className="input-group">
                <label>Course Name</label>
                <input type="text" placeholder="e.g. Advanced Software Architecture" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Description (Optional)</label>
                <textarea placeholder="Brief description of the course..." value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT COURSE MODAL ================= */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Edit Course Details</h2>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSaveEditCourse}>
              <div className="modal-row">
                <div className="input-group">
                  <label>Course Code</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Credits</label>
                  <input type="number" min="1" max="8" value={formData.credits} onChange={(e) => setFormData({...formData, credits: e.target.value})} required />
                </div>
              </div>
              <div className="input-group">
                <label>Course Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Description (Optional)</label>
                <textarea placeholder="Brief description of the course..." value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-save">Update Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {confirmDeleteDialog.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="modal-box small">
            <FiAlertTriangle className="modal-message-icon warning" />
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to completely remove <strong>{confirmDeleteDialog.code}</strong> from the system? This action cannot be undone.</p>
            
            <div className="modal-actions justify-center">
              <button className="btn-cancel" onClick={() => setConfirmDeleteDialog({ isOpen: false, id: null, code: null })}>Cancel</button>
              <button className="btn-danger" onClick={executeDeleteCourse}>Yes, Delete Course</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUCCESS/ERROR MESSAGE MODAL ================= */}
      {messageDialog.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-box small">
            {messageDialog.type === 'success' && <FiCheckCircle className="modal-message-icon success" />}
            {messageDialog.type === 'error' && <FiAlertTriangle className="modal-message-icon error" />}
            {messageDialog.type === 'info' && <FiInfo className="modal-message-icon" style={{ color: '#1a4d8c' }} />}
            
            <h2>{messageDialog.type === 'success' ? 'Success!' : messageDialog.type === 'error' ? 'Error' : 'Notice'}</h2>
            <p>{messageDialog.message}</p>
            
            <div className="modal-actions justify-center">
              <button className="btn-save" onClick={() => setMessageDialog({ isOpen: false, message: '', type: 'success' })}>OK</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Courses;