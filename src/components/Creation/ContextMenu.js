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
        border: '1px solid #ccc',
        borderRadius: 6,
        padding: 10,
        boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
        zIndex: 1000,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={() => onStyleChange('bold')}>Bold</button>
      <button onClick={() => onStyleChange('italic')}>Italic</button>
      <button onClick={() => onStyleChange('underline')}>Underline</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default ContextMenu;
