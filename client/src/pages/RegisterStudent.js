import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import './RegisterStudent.css';

const RegisterStudent = () => {

  useEffect(() => {
    document.title = "Register Student | KDU SMS";
  }, []);

  // State for all form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [birthday, setBirthday] = useState('');
  const [nationalId, setNationalId] = useState(''); // User clarified this is National ID
  const [degree, setDegree] = useState('');
  const [intake, setIntake] = useState('');
  
  // State for courses and unique ID
  const [courseInput, setCourseInput] = useState('');
  const [courses, setCourses] = useState([]);
  const [generatedId, setGeneratedId] = useState('Pending...');

  // Effect: Auto-generate ID preview when Degree or Intake changes
  useEffect(() => {
    if (degree && intake) {
      const degreeCode = degree === 'Software Engineering' ? 'BSE' : 'BCS';
      // Shows a preview. The actual "0001" will be handled by the database later.
      setGeneratedId(`D/${degreeCode}/${intake}/[Auto-Generated]`);
    } else {
      setGeneratedId('Pending...');
    }
  }, [degree, intake]);

  // Handle adding a course when pressing "Enter"
  const handleCourseKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Stop form from submitting
      if (courseInput.trim() !== '' && !courses.includes(courseInput.trim())) {
        setCourses([...courses, courseInput.trim()]);
        setCourseInput(''); // Clear the input box
      }
    }
  };

  // Handle removing a course tag
  const removeCourse = (courseToRemove) => {
    setCourses(courses.filter(course => course !== courseToRemove));
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Package the data to send to your Node.js backend later
    const newStudentData = {
      first_name: firstName,
      last_name: lastName,
      address,
      birthday,
      national_id: nationalId,
      degree_program: degree,
      intake_number: intake,
      courses: courses
    };

    console.log("Saving Student Data:", newStudentData);
    alert("Student Registration logic ready! Data logged in console.");
    // NOTE: In the next phase, we will use fetch() here to send this to Port 8081!
  };

  // Clear form
  const handleClear = () => {
    setFirstName(''); setLastName(''); setAddress(''); setBirthday('');
    setNationalId(''); setDegree(''); setIntake(''); setCourses([]);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Register New Student</h1>
          <h2>Enter student and enrollment details</h2>
        </div>

        <div className="form-container">
          
          {/* Unique ID Display */}
          <div className="id-preview-box">
            <span>System Generated Student ID:</span>
            <span>{generatedId}</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="input-group">
                <label>First Name</label>
                <input type="text" placeholder="Enter First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input type="text" placeholder="Enter Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
            </div>

            <div className="input-group">
              <label>Student Address</label>
              <input type="text" placeholder="Enter Address" value={address} onChange={e => setAddress(e.target.value)} required />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Student Birthday</label>
                <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>National ID Number</label>
                <input type="text" placeholder="Enter National ID (NIC)" value={nationalId} onChange={e => setNationalId(e.target.value)} required />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Intake</label>
                <select value={intake} onChange={e => setIntake(e.target.value)} required>
                  <option value="" disabled>Select Intake</option>
                  <option value="40">Intake 40</option>
                  <option value="41">Intake 41</option>
                  <option value="42">Intake 42</option>
                </select>
              </div>
              <div className="input-group">
                <label>Degree Program</label>
                <select value={degree} onChange={e => setDegree(e.target.value)} required>
                  <option value="" disabled>Select Degree</option>
                  <option value="Software Engineering">Software Engineering (BSE)</option>
                  <option value="Computer Science">Computer Science (BCS)</option>
                </select>
              </div>
            </div>

            {/* Courses: Search / Type to Enter */}
            <div className="input-group">
              <label>Enrolled Courses (Type and press Enter)</label>
              <input 
                type="text" 
                placeholder="e.g. SE3032 - Software Construction" 
                value={courseInput}
                onChange={e => setCourseInput(e.target.value)}
                onKeyDown={handleCourseKeyDown}
              />
              <div className="course-tags-container">
                {courses.map((course, index) => (
                  <div key={index} className="course-tag">
                    {course}
                    <button type="button" onClick={() => removeCourse(course)}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-clear" onClick={handleClear}>Clear</button>
              <button type="submit" className="btn-save">Save Student</button>
            </div>
          </form>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default RegisterStudent;