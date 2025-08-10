import React, { useState, useEffect, useRef } from 'react';

// Generate professional watermark layout patterns
const generateWatermarkLayout = (hash, pattern, certificateWidth = 800, certificateHeight = 600) => {
  const patterns = {
    'border-continuous': (hash, width, height) => {
      const elements = [];
      const hashWithSpace = hash + ' ';
      const hashLength = hashWithSpace.length;
      
      // Define the working area (inside borders) - leave margin from edges
      const margin = 80; // Distance from borders
      const workingWidth = width - (2 * margin);
      const workingHeight = height - (2 * margin);
      
      // Calculate how many complete hash repetitions fit in the working area
      const horizontalChars = Math.floor(workingWidth / 8); // 8px per character
      const verticalChars = Math.floor(workingHeight / 8);
      
      // Place hash in a grid pattern within the working area
      for (let row = 0; row < Math.floor(verticalChars / 3); row++) {
        for (let col = 0; col < horizontalChars; col++) {
          const charIndex = (row * horizontalChars + col) % hashLength;
          elements.push({
            char: hashWithSpace[charIndex],
            x: margin + (col * 8),
            y: margin + (row * 24), // 24px spacing between rows
            rotation: 0
          });
        }
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

// Function to sample background color at a specific position
const sampleBackgroundColor = (canvas, x, y) => {
  try {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(x, y, 1, 1);
    const data = imageData.data;
    return {
      r: data[0],
      g: data[1],
      b: data[2],
      a: data[3]
    };
  } catch (error) {
    // Fallback to a neutral color if sampling fails
    return { r: 255, g: 255, b: 255, a: 255 };
  }
};

// Function to blend colors for stealth watermarking
const blendWithBackground = (backgroundColor, intensity = 0.98) => {
  // Use light grey color that's lightly visible
  // This makes the hash detectable but not intrusive
  return {
    r: 200, // Light grey
    g: 200, // Light grey
    b: 200, // Light grey
    a: backgroundColor.a * intensity
  };
};

// Function to convert RGB to hex
const rgbToHex = (r, g, b) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const Watermark = ({ userName, pattern, hash, certificateSize = 'A4-Horizontal' }) => {
  const [watermarkElements, setWatermarkElements] = useState([]);
  const [stealthColors, setStealthColors] = useState({});
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

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

  // Function to analyze background and generate stealth colors
  const analyzeBackground = () => {
    if (!containerRef.current || !hash) return;

    const container = containerRef.current;
    const dimensions = getCertificateDimensions(certificateSize);
    
    // Generate layout and apply light grey color to all elements
    const layout = generateWatermarkLayout(hash, pattern, dimensions.width, dimensions.height);
    const colors = {};
    
    layout.forEach((element, index) => {
      // Use light grey color for all elements
      const stealthColor = blendWithBackground({ r: 255, g: 255, b: 255, a: 255 }, 0.995);
      colors[index] = rgbToHex(stealthColor.r, stealthColor.g, stealthColor.b);
    });
    
    setStealthColors(colors);
    setWatermarkElements(layout);
  };

  useEffect(() => {
    const generateWatermark = async () => {
      if (!userName || !pattern || !hash) return;
      
      try {
        const dimensions = getCertificateDimensions(certificateSize);
        const layout = generateWatermarkLayout(hash, pattern, dimensions.width, dimensions.height);
        setWatermarkElements(layout);
        
        // Analyze background after a short delay to ensure DOM is ready
        setTimeout(analyzeBackground, 100);
      } catch (error) {
        console.error('Error generating watermark layout:', error);
      }
    };

    generateWatermark();
  }, [userName, pattern, hash, certificateSize]);

  if (!userName || !pattern || !hash || watermarkElements.length === 0) return null;

  return (
    <div
      ref={containerRef}
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
      {watermarkElements.map((element, index) => {
        const stealthColor = stealthColors[index] || '#ffffff';
        
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: element.x,
              top: element.y,
              fontSize: 12, // Maintain original font size
              color: stealthColor, // Use stealth color that blends with background
              fontFamily: '"Courier New", "Monaco", "Consolas", monospace', // Monospace for consistent character width
              fontWeight: 400,
              transform: `rotate(${element.rotation}deg)`,
              whiteSpace: 'nowrap',
              letterSpacing: '0.5px', // Slight spacing for better readability
              // Remove text shadow and opacity to make it truly stealth
              // The color blending makes it nearly invisible to humans
              // but still present in the DOM and retrievable
            }}
          >
            {element.char}
          </div>
        );
      })}
    </div>
  );
};

export default Watermark;

