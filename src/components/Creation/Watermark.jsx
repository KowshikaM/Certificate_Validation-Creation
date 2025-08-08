import React, { useState, useEffect } from 'react';

// SHA-256 encryption function
const sha256 = async (message) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// Generate random watermark layout
const generateWatermarkLayout = (hash, pattern) => {
  const patterns = {
    'cross': (hash) => {
      const chars = hash.substring(0, 16).split('');
      const centerX = 400;
      const centerY = 300;
      return [
        // Horizontal line
        ...chars.slice(0, 8).map((char, index) => ({
          char: char.toUpperCase(),
          x: centerX - 140 + (index * 35),
          y: centerY,
          rotation: 0
        })),
        // Vertical line
        ...chars.slice(8, 16).map((char, index) => ({
          char: char.toUpperCase(),
          x: centerX,
          y: centerY - 140 + (index * 35),
          rotation: 90
        }))
      ];
    },
    'plus': (hash) => {
      const chars = hash.substring(0, 12).split('');
      const centerX = 400;
      const centerY = 300;
      return [
        // Horizontal line
        ...chars.slice(0, 4).map((char, index) => ({
          char: char.toUpperCase(),
          x: centerX - 70 + (index * 35),
          y: centerY,
          rotation: 0
        })),
        // Vertical line
        ...chars.slice(4, 8).map((char, index) => ({
          char: char.toUpperCase(),
          x: centerX,
          y: centerY - 70 + (index * 35),
          rotation: 90
        })),
        // Additional horizontal line
        ...chars.slice(8, 12).map((char, index) => ({
          char: char.toUpperCase(),
          x: centerX - 70 + (index * 35),
          y: centerY + 70,
          rotation: 0
        }))
      ];
    },
    'bottom-border': (hash) => {
      const chars = hash.substring(0, 20).split('');
      return chars.map((char, index) => ({
        char: char.toUpperCase(),
        x: 50 + (index * 35),
        y: 550,
        rotation: 0
      }));
    },
    'corner-borders': (hash) => {
      const chars = hash.substring(0, 24).split('');
      return [
        // Top-left corner
        ...chars.slice(0, 6).map((char, index) => ({
          char: char.toUpperCase(),
          x: 50 + (index * 25),
          y: 50,
          rotation: 0
        })),
        // Top-right corner
        ...chars.slice(6, 12).map((char, index) => ({
          char: char.toUpperCase(),
          x: 650 + (index * 25),
          y: 50,
          rotation: 0
        })),
        // Bottom-left corner
        ...chars.slice(12, 18).map((char, index) => ({
          char: char.toUpperCase(),
          x: 50 + (index * 25),
          y: 550,
          rotation: 0
        })),
        // Bottom-right corner
        ...chars.slice(18, 24).map((char, index) => ({
          char: char.toUpperCase(),
          x: 650 + (index * 25),
          y: 550,
          rotation: 0
        }))
      ];
    },
    'l-shape': (hash) => {
      const chars = hash.substring(0, 16).split('');
      return [
        // Vertical part of L
        ...chars.slice(0, 8).map((char, index) => ({
          char: char.toUpperCase(),
          x: 100,
          y: 100 + (index * 35),
          rotation: 0
        })),
        // Horizontal part of L
        ...chars.slice(8, 16).map((char, index) => ({
          char: char.toUpperCase(),
          x: 100 + (index * 35),
          y: 380,
          rotation: 0
        }))
      ];
    },
    't-shape': (hash) => {
      const chars = hash.substring(0, 16).split('');
      const centerX = 400;
      const centerY = 300;
      return [
        // Top horizontal line of T
        ...chars.slice(0, 8).map((char, index) => ({
          char: char.toUpperCase(),
          x: centerX - 140 + (index * 35),
          y: centerY - 70,
          rotation: 0
        })),
        // Vertical line of T
        ...chars.slice(8, 16).map((char, index) => ({
          char: char.toUpperCase(),
          x: centerX,
          y: centerY - 70 + (index * 35),
          rotation: 90
        }))
      ];
    }
  };
  
  return patterns[pattern] ? patterns[pattern](hash) : patterns['cross'](hash);
};

const Watermark = ({ userName, pattern, hash }) => {
  const [watermarkElements, setWatermarkElements] = useState([]);

  useEffect(() => {
    const generateWatermark = async () => {
      if (!userName || !pattern || !hash) return;
      
      try {
        const layout = generateWatermarkLayout(hash, pattern);
        setWatermarkElements(layout);
      } catch (error) {
        console.error('Error generating watermark layout:', error);
      }
    };

    generateWatermark();
  }, [userName, pattern, hash]);

  if (!userName || !pattern || !hash || watermarkElements.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 1,
      }}
    >
      {watermarkElements.map((element, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: element.x,
            top: element.y,
            opacity: 0.06,
            fontSize: 12,
            color: '#3a6ea5',
            fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif',
            fontWeight: 300,
            transform: `rotate(${element.rotation}deg)`,
            whiteSpace: 'nowrap',
          }}
        >
          {element.char}
        </div>
      ))}
    </div>
  );
};

export default Watermark;
