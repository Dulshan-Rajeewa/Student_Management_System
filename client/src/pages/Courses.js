import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { FiSearch, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import './Courses.css';

const Courses = () => {
  useEffect(() => {
    document.title = "Manage Courses | KDU SMS";
  }, []);

  // Dummy data matching your database schema (Course Code, Name, Credits)
  const [courses, setCourses] = useState([
    { id: '1', code: 'SE3032', name: 'Software Construction', credits: 3 },
    { id: '2', code: 'CS101', name: 'Mobile Computing', credits: 4 },
    { id: '3', code: 'MA202', name: 'Engineering Mathematics', credits: 3 },
    { id: '4', code: 'SE3044', name: 'Algorithms & Data Structures', credits: 4 },
    { id: '5', code: 'SE3055', name: 'Professional Ethics', credits: 2 },
    { id: '6', code: 'SE3099', name: 'Web Technologies', credits: 3 },
    { id: '7', code: 'CS205', name: 'Database Management Systems', credits: 4 },
    { id: '8', code: 'SE4010', name: 'Software Architecture', credits: 3 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  // --- LOGIC: FILTERING ---
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LOGIC: ACTIONS ---
  const handleAddCourse = () => {
    alert("Open 'Add Course' Modal (Backend: POST /api/courses)");
  };

  const handleEditCourse = (code) => {
    alert(`Open 'Edit Course' Modal for ${code} (Backend: PUT /api/courses/${code})`);
  };

  const handleDeleteCourse = (code) => {
    if (window.confirm(`Are you sure you want to completely remove course ${code} from the system?`)) {
      setCourses(courses.filter(c => c.code !== code));
      alert(`Course ${code} removed! (Backend logic pending)`);
    }
  };

  const [showAddText, setShowAddText] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="courses-header">
          <h1>Courses</h1>
        </div>

        {/* Top Bar: Search and Add Button */}
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

        <button className="add-course-toggle" onClick={handleAddCourse}>
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
                  </div>
                  {/* Credits displayed as the large number in your mockup */}
                  <div className="course-credits" title="Current Enrollment">
                    <span className="credits-label">Enrolled</span>
                    <span className="credits-number">{course.credits}</span>
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                <div className="course-actions">
                  <button 
                    className="card-icon-btn edit" 
                    title="Edit Course"
                    onClick={() => handleEditCourse(course.code)}
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
    </div>
  );
};

export default Courses;