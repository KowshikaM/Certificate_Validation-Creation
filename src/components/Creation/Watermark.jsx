import React from 'react';

const Watermark = ({ userName }) => {
  if (!userName) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-30deg)',
        opacity: 0.06,
        fontSize: 80,
        color: '#3a6ea5',
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        zIndex: 1,
        fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif',
        fontWeight: 300,
      }}
    >
      {userName}
    </div>
  );
};

export default Watermark;
