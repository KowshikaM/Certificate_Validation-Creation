import React, { useState, useEffect } from 'react';

// Generate professional watermark layout patterns
const generateWatermarkLayout = (hash, pattern, certificateWidth = 800, certificateHeight = 600) => {
  const patterns = {
    'border-continuous': (hash, width, height) => {
      const elements = [];
      const hashWithSpace = hash + ' ';
      const hashLength = hashWithSpace.length;
      
      // Calculate how many complete hash repetitions fit in each border
      const topBottomChars = Math.floor((width - 40) / 8); // 8px per character
      const leftRightChars = Math.floor((height - 40) / 8);
      
      // Top border - complete hash repetitions
      for (let i = 0; i < topBottomChars; i++) {
        const charIndex = i % hashLength;
        elements.push({
          char: hashWithSpace[charIndex],
          x: 20 + (i * 8),
          y: 20,
          rotation: 0
        });
      }
      
      // Bottom border - complete hash repetitions
      for (let i = 0; i < topBottomChars; i++) {
        const charIndex = i % hashLength;
        elements.push({
          char: hashWithSpace[charIndex],
          x: 20 + (i * 8),
          y: height - 20,
          rotation: 0
        });
      }
      
      // Left border - complete hash repetitions
      for (let i = 0; i < leftRightChars; i++) {
        const charIndex = i % hashLength;
        elements.push({
          char: hashWithSpace[charIndex],
          x: 20,
          y: 40 + (i * 8),
          rotation: 90
        });
      }
      
      // Right border - complete hash repetitions
      for (let i = 0; i < leftRightChars; i++) {
        const charIndex = i % hashLength;
        elements.push({
          char: hashWithSpace[charIndex],
          x: width - 20,
          y: 40 + (i * 8),
          rotation: 90
        });
      }
      
      return elements;
    },
    
    'horizontal-center': (hash, width, height) => {
      const elements = [];
      const centerY = height / 2;
      const hashWithSpace = hash + ' ';
      const hashLength = hashWithSpace.length;
      const charsPerLine = Math.floor((width - 60) / 8); // 8px per character
      
      for (let i = 0; i < charsPerLine; i++) {
        const charIndex = i % hashLength;
        elements.push({
          char: hashWithSpace[charIndex],
          x: 30 + (i * 8),
          y: centerY,
          rotation: 0
        });
      }
      
      return elements;
    },
    
    'vertical-center': (hash, width, height) => {
      const elements = [];
      const centerX = width / 2;
      const hashWithSpace = hash + ' ';
      const hashLength = hashWithSpace.length;
      const charsPerColumn = Math.floor((height - 60) / 8); // 8px per character
      
      for (let i = 0; i < charsPerColumn; i++) {
        const charIndex = i % hashLength;
        elements.push({
          char: hashWithSpace[charIndex],
          x: centerX,
          y: 30 + (i * 8),
          rotation: 90
        });
      }
      
      return elements;
    },
    
    'cross-pattern': (hash, width, height) => {
      const elements = [];
      const centerX = width / 2;
      const centerY = height / 2;
      const hashWithSpace = hash + ' ';
      const hashLength = hashWithSpace.length;
      
      // Horizontal line
      const horizontalChars = Math.floor((width - 60) / 8);
      for (let i = 0; i < horizontalChars; i++) {
        const charIndex = i % hashLength;
        elements.push({
          char: hashWithSpace[charIndex],
          x: 30 + (i * 8),
          y: centerY,
          rotation: 0
        });
      }
      
      // Vertical line
      const verticalChars = Math.floor((height - 60) / 8);
      for (let i = 0; i < verticalChars; i++) {
        const charIndex = i % hashLength;
        elements.push({
          char: hashWithSpace[charIndex],
          x: centerX,
          y: 30 + (i * 8),
          rotation: 90
        });
      }
      
      return elements;
    },
    
    'diagonal-lines': (hash, width, height) => {
      const elements = [];
      const centerX = width / 2;
      const centerY = height / 2;
      const hashWithSpace = hash + ' ';
      const hashLength = hashWithSpace.length;
      const diagonalLength = Math.min(width, height) / 2 - 50;
      const charsPerDiagonal = Math.floor(diagonalLength / 8);
      
      // Diagonal from top-left to bottom-right
      for (let i = 0; i < charsPerDiagonal; i++) {
        const charIndex = i % hashLength;
        const progress = i / charsPerDiagonal;
        const x = centerX - diagonalLength/2 + (progress * diagonalLength);
        const y = centerY - diagonalLength/2 + (progress * diagonalLength);
        elements.push({
          char: hashWithSpace[charIndex],
          x: x,
          y: y,
          rotation: 45
        });
      }
      
      // Diagonal from top-right to bottom-left
      for (let i = 0; i < charsPerDiagonal; i++) {
        const charIndex = i % hashLength;
        const progress = i / charsPerDiagonal;
        const x = centerX + diagonalLength/2 - (progress * diagonalLength);
        const y = centerY - diagonalLength/2 + (progress * diagonalLength);
        elements.push({
          char: hashWithSpace[charIndex],
          x: x,
          y: y,
          rotation: -45
        });
      }
      
      return elements;
    },
    
    'l-shaped': (hash, width, height) => {
      const elements = [];
      const hashWithSpace = hash + ' ';
      const hashLength = hashWithSpace.length;
      const lSize = Math.min(width, height) / 3;
      
      // Vertical part of L (left side)
      const verticalChars = Math.floor(lSize / 8);
      for (let i = 0; i < verticalChars; i++) {
        const charIndex = i % hashLength;
        elements.push({
          char: hashWithSpace[charIndex],
          x: 50,
          y: 50 + (i * 8),
          rotation: 90
        });
      }
      
      // Horizontal part of L (bottom)
      const horizontalChars = Math.floor(lSize / 8);
      for (let i = 0; i < horizontalChars; i++) {
        const charIndex = i % hashLength;
        elements.push({
          char: hashWithSpace[charIndex],
          x: 50 + (i * 8),
          y: 50 + lSize,
          rotation: 0
        });
      }
      
      return elements;
    },
    
    't-shaped': (hash, width, height) => {
      const elements = [];
      const centerX = width / 2;
      const centerY = height / 2;
      const hashWithSpace = hash + ' ';
      const hashLength = hashWithSpace.length;
      const tSize = Math.min(width, height) / 4;
      
      // Top horizontal line of T
      const horizontalChars = Math.floor(tSize / 8);
      for (let i = 0; i < horizontalChars; i++) {
        const charIndex = i % hashLength;
        elements.push({
          char: hashWithSpace[charIndex],
          x: centerX - tSize/2 + (i * 8),
          y: centerY - tSize/2,
          rotation: 0
        });
      }
      
      // Vertical line of T
      const verticalChars = Math.floor(tSize / 8);
      for (let i = 0; i < verticalChars; i++) {
        const charIndex = i % hashLength;
        elements.push({
          char: hashWithSpace[charIndex],
          x: centerX,
          y: centerY - tSize/2 + (i * 8),
          rotation: 90
        });
      }
      
      return elements;
    },
    
    'corner-focus': (hash, width, height) => {
      const elements = [];
      const hashWithSpace = hash + ' ';
      const hashLength = hashWithSpace.length;
      const cornerSize = 120;
      
      // Top-left corner
      for (let i = 0; i < Math.floor(cornerSize / 8); i++) {
        const charIndex = i % hashLength;
        elements.push({
          char: hashWithSpace[charIndex],
          x: 30 + (i * 8),
          y: 30,
          rotation: 0
        });
        elements.push({
          char: hashWithSpace[charIndex],
          x: 30,
          y: 38 + (i * 8),
          rotation: 90
        });
      }
      
      // Top-right corner
      for (let i = 0; i < Math.floor(cornerSize / 8); i++) {
        const charIndex = i % hashLength;
        elements.push({
          char: hashWithSpace[charIndex],
          x: width - 30 - (i * 8),
          y: 30,
          rotation: 0
        });
        elements.push({
          char: hashWithSpace[charIndex],
          x: width - 30,
          y: 38 + (i * 8),
          rotation: 90
        });
      }
      
      // Bottom-left corner
      for (let i = 0; i < Math.floor(cornerSize / 8); i++) {
        const charIndex = i % hashLength;
        elements.push({
          char: hashWithSpace[charIndex],
          x: 30 + (i * 8),
          y: height - 30,
          rotation: 0
        });
        elements.push({
          char: hashWithSpace[charIndex],
          x: 30,
          y: height - 38 - (i * 8),
          rotation: 90
        });
      }
      
      // Bottom-right corner
      for (let i = 0; i < Math.floor(cornerSize / 8); i++) {
        const charIndex = i % hashLength;
        elements.push({
          char: hashWithSpace[charIndex],
          x: width - 30 - (i * 8),
          y: height - 30,
          rotation: 0
        });
        elements.push({
          char: hashWithSpace[charIndex],
          x: width - 30,
          y: height - 38 - (i * 8),
          rotation: 90
        });
      }
      
      return elements;
    }
  };
  
  return patterns[pattern] ? patterns[pattern](hash, certificateWidth, certificateHeight) : patterns['border-continuous'](hash, certificateWidth, certificateHeight);
};

const Watermark = ({ userName, pattern, hash, certificateSize = 'A4-Horizontal' }) => {
  const [watermarkElements, setWatermarkElements] = useState([]);

  // Get certificate dimensions based on size
  const getCertificateDimensions = (size) => {
    const dimensions = {
      'A4-Horizontal': { width: 800, height: 600 },
      'A4-Vertical': { width: 600, height: 800 },
      'A3-Horizontal': { width: 1000, height: 700 },
      'A3-Vertical': { width: 700, height: 1000 }
    };
    return dimensions[size] || dimensions['A4-Horizontal'];
  };

  useEffect(() => {
    const generateWatermark = async () => {
      if (!userName || !pattern || !hash) return;
      
      try {
        const dimensions = getCertificateDimensions(certificateSize);
        const layout = generateWatermarkLayout(hash, pattern, dimensions.width, dimensions.height);
        setWatermarkElements(layout);
      } catch (error) {
        console.error('Error generating watermark layout:', error);
      }
    };

    generateWatermark();
  }, [userName, pattern, hash, certificateSize]);

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
            opacity: 0.12, // Clearly visible but not distracting
            fontSize: 12, // Appropriate size for hash characters
            color: '#2c3e50', // Dark color for good contrast
            fontFamily: '"Courier New", "Monaco", "Consolas", monospace', // Monospace for consistent character width
            fontWeight: 400,
            transform: `rotate(${element.rotation}deg)`,
            whiteSpace: 'nowrap',
            textShadow: '0 1px 2px rgba(255,255,255,0.5)', // Subtle shadow for better visibility
            letterSpacing: '0.5px', // Slight spacing for better readability
          }}
        >
          {element.char}
        </div>
      ))}
    </div>
  );
};

export default Watermark;

