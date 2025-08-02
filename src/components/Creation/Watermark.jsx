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
        opacity: 0.08,
        fontSize: 80,
        color: '#222',
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        zIndex: 1,
      }}
    >
      {userName}
    </div>
  );
};

export default Watermark;
