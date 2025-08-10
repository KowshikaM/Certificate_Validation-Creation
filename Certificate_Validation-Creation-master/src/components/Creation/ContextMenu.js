// ContextMenu.js
import React from 'react';

const ContextMenu = ({ x, y, onStyleChange, onClose }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: x,
        backgroundColor: '#fff',
        border: '1.5px solid #d1d9e6',
        borderRadius: 10,
        padding: '12px',
        boxShadow: '0 6px 24px rgba(60, 80, 120, 0.12)',
        zIndex: 1000,
        fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif',
        minWidth: '120px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        onClick={() => onStyleChange('bold')}
        style={{
          display: 'block',
          width: '100%',
          padding: '8px 12px',
          margin: '2px 0',
          border: 'none',
          borderRadius: 6,
          background: '#e3ecfa',
          color: '#3a6ea5',
          cursor: 'pointer',
          fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif',
          fontSize: '0.9rem',
          fontWeight: 500,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#3a6ea5';
          e.target.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#e3ecfa';
          e.target.style.color = '#3a6ea5';
        }}
      >
        Bold
      </button>
      <button 
        onClick={() => onStyleChange('italic')}
        style={{
          display: 'block',
          width: '100%',
          padding: '8px 12px',
          margin: '2px 0',
          border: 'none',
          borderRadius: 6,
          background: '#e3ecfa',
          color: '#3a6ea5',
          cursor: 'pointer',
          fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif',
          fontSize: '0.9rem',
          fontWeight: 500,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#3a6ea5';
          e.target.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#e3ecfa';
          e.target.style.color = '#3a6ea5';
        }}
      >
        Italic
      </button>
      <button 
        onClick={() => onStyleChange('underline')}
        style={{
          display: 'block',
          width: '100%',
          padding: '8px 12px',
          margin: '2px 0',
          border: 'none',
          borderRadius: 6,
          background: '#e3ecfa',
          color: '#3a6ea5',
          cursor: 'pointer',
          fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif',
          fontSize: '0.9rem',
          fontWeight: 500,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#3a6ea5';
          e.target.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#e3ecfa';
          e.target.style.color = '#3a6ea5';
        }}
      >
        Underline
      </button>
      <button 
        onClick={onClose}
        style={{
          display: 'block',
          width: '100%',
          padding: '8px 12px',
          margin: '2px 0',
          border: 'none',
          borderRadius: 6,
          background: '#f8f9fa',
          color: '#6c757d',
          cursor: 'pointer',
          fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif',
          fontSize: '0.9rem',
          fontWeight: 500,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#6c757d';
          e.target.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#f8f9fa';
          e.target.style.color = '#6c757d';
        }}
      >
        Close
      </button>
    </div>
  );
};

export default ContextMenu;
