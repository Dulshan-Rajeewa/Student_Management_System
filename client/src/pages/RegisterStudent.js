import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import './RegisterStudent.css';
import { logActivity } from '../utils/auditLogger';

const RegisterStudent = () => {
  useEffect(() => {
    document.title = "Register Student | KDU SMS";
  }, []);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [birthday, setBirthday] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [degree, setDegree] = useState('');
  const [intake, setIntake] = useState('');
  
  const [courseInput, setCourseInput] = useState('');
  const [courses, setCourses] = useState([]);
  const [generatedId, setGeneratedId] = useState('Pending...');
  
  // Stores courses fetched from the Course Backend (Port 8082)
  const [availableCourses, setAvailableCourses] = useState([]);

  // Custom Modal State
  const [messageDialog, setMessageDialog] = useState({ isOpen: false, message: '', type: 'success' });

  // FETCH AVAILABLE COURSES ON LOAD
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:8082/api/courses');
        if (response.ok) {
          const data = await response.json();
          setAvailableCourses(data);
        }
      } catch (err) {
        console.error("Failed to fetch available courses:", err);
      }
    };
    fetchCourses();
  }, []);

  // AUTO-GENERATE STUDENT ID
  useEffect(() => {
    const fetchNextId = async () => {
      if (degree && intake) {
        setGeneratedId('Generating...');
        try {
          const res = await fetch(`http://localhost:8081/api/students/generate-id?degree=${degree}&intake=${intake}`);
          if (res.ok) {
            const data = await res.json();
            setGeneratedId(data.generatedId);
          } else {
            setGeneratedId('Error generating ID');
          }
        } catch (err) {
          setGeneratedId('Network Error');
        }
      } else {
        setGeneratedId('Pending...');
      }
    };
    
    fetchNextId();
  }, [degree, intake]);

  const showMessage = (msg, type = "success") => {
    setMessageDialog({ isOpen: true, message: msg, type });
  };

  // ADD COURSE TAG (Validates against available courses)
  const handleCourseKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      const input = courseInput.trim().toUpperCase();
      
      // Check if typed course code exists in DB
      const courseExists = availableCourses.find(c => c.course_code.toUpperCase() === input);

      if (courseExists) {
        if (!courses.includes(courseExists.course_code)) {
          setCourses([...courses, courseExists.course_code]);
        }
        setCourseInput(''); 
      } else {
        showMessage(`Course code "${input}" not found in system. Please check the active courses.`, 'error');
      }
    }
  };

  const removeCourse = (courseToRemove) => {
    setCourses(courses.filter(course => course !== courseToRemove));
  };

  // SUBMIT STUDENT TO DATABASE
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (generatedId === 'Pending...' || generatedId === 'Generating...' || generatedId === 'Error generating ID') {
      showMessage("Please wait for a valid Student ID to be generated.", "error");
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_number: generatedId,
          intake_number: intake,
          first_name: firstName,
          last_name: lastName,
          address: address,
          birthday: birthday,
          degree_program: degree,
          courses: courses // Sends array of course codes (e.g. ["SE3032", "CS101"])
        }),
      });

      if (response.ok) {
        showMessage(`Student ${firstName} ${lastName} (${generatedId}) registered successfully!`, "success");
        logActivity('CREATE', 'STUDENT', generatedId, `Registered new student: ${firstName} ${lastName}`);
        handleClear();
      } else {
        showMessage("Failed to register student. National ID or Student Number might already exist.", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Server error connecting to Student Service.", "error");
    }
  };

  const handleClear = () => {
    setFirstName(''); setLastName(''); setAddress(''); setBirthday('');
    setNationalId(''); setDegree(''); setIntake(''); setCourses([]);
    setCourseInput('');
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Register New Student</h1>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>First Name</label>
              <input type="text" placeholder="Enter First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input type="text" placeholder="Enter Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Student Address</label>
              <input type="text" placeholder="Enter Address" value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Student Birthday</label>
              <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>National ID Number</label>
              <input type="text" placeholder="Enter National ID (NIC)" value={nationalId} onChange={e => setNationalId(e.target.value)} required />
            </div>
            
            <div className="input-group">
              <label>Intake</label>
              <select value={intake} onChange={e => setIntake(e.target.value)} required>
                <option value="" disabled>Select Intake</option>
                <option value="39">Intake 39</option>
                <option value="40">Intake 40</option>
                <option value="41">Intake 41</option>
                <option value="42">Intake 42</option>
                <option value="43">Intake 43</option>
              </select>
            </div>
            <div className="input-group">
              <label>Degree Program</label>
              <select value={degree} onChange={e => setDegree(e.target.value)} required>
                <option value="" disabled>Select Degree</option>
                <option value="BSE">Software Engineering (BSE)</option>
                <option value="BCS">Computer Science (BCS)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="IS">Information Systems (IS)</option>
              </select>
            </div>

            <div className="input-group">
              <label>Enrolled Courses (Type code and press Enter)</label>
              {/* DataList allows searching through the fetched DB courses */}
              <input 
                type="text" 
                list="available-courses"
                placeholder="e.g. SE3032" 
                value={courseInput}
                onChange={e => setCourseInput(e.target.value)}
                onKeyDown={handleCourseKeyDown}
              />
              <datalist id="available-courses">
                {availableCourses.map(course => (
                  <option key={course.id} value={course.course_code}>
                    {course.course_name}
                  </option>
                ))}
              </datalist>

              <div className="course-tags-container">
                {courses.map((course, index) => (
                  <div key={index} className="course-tag">
                    <button type="button" onClick={() => removeCourse(course)}>✕</button>
                    {course}                    
                  </div>
                ))}
              </div>
            </div>
            
            <div className="id-preview-box">
              <span>System Generated Student ID:</span>
              <span>{generatedId}</span>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-clear" onClick={handleClear}>Clear</button>
              <button type="submit" className="btn-save">Save Student</button>
            </div>
          </form>
        </div>
        <Footer />
      </div>

      {/* ================= CUSTOM MESSAGE MODAL ================= */}
      {messageDialog.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-box small">
            {messageDialog.type === 'success' && <FiCheckCircle className="modal-message-icon success" />}
            {messageDialog.type === 'error' && <FiAlertTriangle className="modal-message-icon error" />}
            
            <h2>{messageDialog.type === 'success' ? 'Success!' : 'Notice'}</h2>
            <p>{messageDialog.message}</p>
            
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-save" onClick={() => setMessageDialog({ isOpen: false, message: '', type: 'success' })}>OK</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RegisterStudent;