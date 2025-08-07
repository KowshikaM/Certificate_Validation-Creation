import React from 'react';

const DetectorSection = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f7fafd',
      padding: '2rem',
      fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '3rem',
        boxShadow: '0 8px 32px rgba(60, 80, 120, 0.12)',
        border: '1px solid rgba(209, 217, 230, 0.5)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h2 style={{ 
          color: '#3a6ea5', 
          marginBottom: '1rem',
          fontSize: '2rem',
          fontWeight: 600
        }}>
          Certificate Detector
        </h2>
        <p style={{ 
          color: '#5a6c7d', 
          fontSize: '1.1rem',
          lineHeight: 1.6,
          margin: 0
        }}>
          This section is under construction. We're working on bringing you advanced certificate validation features.
        </p>
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#e3ecfa',
          borderRadius: '10px',
          border: '1px solid #d1d9e6'
        }}>
          <p style={{ 
            color: '#3a6ea5', 
            fontSize: '0.95rem',
            margin: 0,
            fontWeight: 500
          }}>
            Coming soon: QR code scanning, blockchain verification, and more!
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetectorSection;
