import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import './Courses.css';

const Courses = () => {
  useEffect(() => {
    document.title = "Manage Courses | KDU SMS";
  }, []);

  // Updated dummy data to separate 'credits' from 'enrolled' students count
  const [courses, setCourses] = useState([
    { id: '1', code: 'SE3032', name: 'Software Construction', credits: 3, enrolled: 50, description: 'Learn advanced software construction and tools.' },
    { id: '2', code: 'CS101', name: 'Mobile Computing', credits: 4, enrolled: 120, description: '' },
    { id: '3', code: 'MA202', name: 'Engineering Mathematics', credits: 3, enrolled: 85, description: '' },
    { id: '4', code: 'SE3044', name: 'Algorithms & Data Structures', credits: 4, enrolled: 65, description: '' },
    { id: '5', code: 'SE3055', name: 'Professional Ethics', credits: 2, enrolled: 110, description: '' },
    { id: '6', code: 'SE3099', name: 'Web Technologies', credits: 3, enrolled: 90, description: '' },
    { id: '7', code: 'CS205', name: 'Database Management Systems', credits: 4, enrolled: 75, description: '' },
    { id: '8', code: 'SE4010', name: 'Software Architecture', credits: 3, enrolled: 40, description: '' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  // --- MODAL STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Shared state for the form inputs
  const [formData, setFormData] = useState({
    id: '', code: '', name: '', credits: '', description: '', enrolled: 0
  });

  // --- LOGIC: FILTERING ---
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LOGIC: ADD COURSE ---
  const openAddModal = () => {
    setFormData({ id: '', code: '', name: '', credits: '', description: '', enrolled: 0 });
    setIsAddModalOpen(true);
  };

  const handleSaveNewCourse = (e) => {
    e.preventDefault();
    const newCourse = {
      ...formData,
      id: Date.now().toString(), // Generate a fake ID for UI purposes
      enrolled: 0 // New courses start with 0 students
    };
    setCourses([...courses, newCourse]);
    setIsAddModalOpen(false);
    alert(`Course ${formData.code} added successfully!`);
  };

  // --- LOGIC: EDIT COURSE ---
  const openEditModal = (course) => {
    setFormData({ ...course });
    setIsEditModalOpen(true);
  };

  const handleSaveEditCourse = (e) => {
    e.preventDefault();
    setCourses(courses.map(c => (c.id === formData.id ? formData : c)));
    setIsEditModalOpen(false);
    alert(`Course ${formData.code} updated successfully!`);
  };

  // --- LOGIC: DELETE COURSE ---
  const handleDeleteCourse = (code) => {
    if (window.confirm(`Are you sure you want to completely remove course ${code} from the system?`)) {
      setCourses(courses.filter(c => c.code !== code));
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="courses-header">
          <h1>Courses</h1>
        </div>

        {/* Top Bar: Search */}
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

        {/* Courses Grid */}
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

                {/* Edit & Delete Actions */}
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
                    onClick={() => handleDeleteCourse(course.code)}
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
                <textarea placeholder="Brief description of the course..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
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
                <textarea placeholder="Brief description of the course..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-save">Update Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Courses;