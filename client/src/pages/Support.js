import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import './Support.css';
import '../pages/RegisterStudent.css'; // Reusing input styles

const Support = () => {
  useEffect(() => {
    document.title = "Help & Support | KDU SMS";
  }, []);

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    alert("Support ticket submitted to the IT Department!");
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="dashboard-header" style={{ marginBottom: '30px' }}>
          <h1>Help & Support</h1>
          <h2>Contact the IT Department or read the FAQs</h2>
        </div>

        <div className="support-container">
          
          {/* Left Column: Contact Form */}
          <div className="settings-section">
            <h3 style={{ color: '#1a4d8c', marginBottom: '20px', fontSize: '18px' }}>Submit a Support Ticket</h3>
            <form onSubmit={handleSupportSubmit}>
              <div className="input-group">
                <label>Issue Subject</label>
                <input type="text" placeholder="e.g., Cannot delete student record" required />
              </div>
              <div className="input-group">
                <label>Detailed Description</label>
                <textarea className="support-input" placeholder="Please describe the issue you are facing in detail..." required></textarea>
              </div>
              <div className="input-group">
                <label>Priority Level</label>
                <select defaultValue="Low">
                  <option value="Low">Low - General Inquiry</option>
                  <option value="Medium">Medium - System Bug</option>
                  <option value="High">High - System Down / Critical</option>
                </select>
              </div>
              <button type="submit" className="btn-save" style={{ marginTop: '10px', width: '100%' }}>Send Message</button>
            </form>
          </div>

          {/* Right Column: FAQs */}
          <div className="faq-card">
            <h3 style={{ color: '#1a4d8c', marginBottom: '20px', fontSize: '18px' }}>Frequently Asked Questions</h3>
            
            <div className="faq-item">
              <h4>How do I update a student's course enrollment?</h4>
              <p>Navigate to the <strong>Students</strong> tab, select the checkboxes next to the desired students, and use the <strong>+ Add Course</strong> button in the bulk actions menu at the top of the table.</p>
            </div>

            <div className="faq-item">
              <h4>Why can't I edit the Audit Logs?</h4>
              <p>For security and compliance reasons, the Audit Trailing system is immutable. Administrators cannot alter or delete system logs.</p>
            </div>

            <div className="faq-item">
              <h4>How are Student IDs generated?</h4>
              <p>The system automatically generates the ID (e.g., D/BSE/24/0001) based on the selected Degree Program and Intake number during the registration process.</p>
            </div>

            <div className="faq-item">
              <h4>What do I do if the system is running slowly?</h4>
              <p>Please submit a High priority ticket using the form on this page. The system utilizes a microservices architecture, and the IT team may need to scale specific services.</p>
            </div>
          </div>

        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Support;