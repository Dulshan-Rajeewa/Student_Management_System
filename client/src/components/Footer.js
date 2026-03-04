import React from 'react';

const Footer = () => {
  return (
    <footer style={footerStyle}>
      © 2026 KDU SMS - Department of Software Engineering
    </footer>
  );
};

const footerStyle = {
  marginTop: '50px',
  padding: '20px',
  textAlign: 'center',
  fontSize: '14px',
  color: '#888',
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #ecebff'
};

export default Footer;