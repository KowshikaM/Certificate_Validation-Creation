import React, { useState, useEffect, useRef, useCallback } from 'react';
import CustomizationPanel from './CustomizationPanel';
import FloatingToolbar from './FloatingToolbar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Draggable from 'react-draggable';
import ContentEditable from 'react-contenteditable';
import { Paper } from '@mui/material';
import './CertificatePreview.css';

const defaultStyles = {
  fontSize: 28,
  color: '#2c3e50',
  fontFamily: 'Georgia, serif',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
};

const CertificatePreview = () => {
  const [styles, setStyles] = useState(defaultStyles);
  const [borderImage, setBorderImage] = useState('');
  const [borderAdjust, setBorderAdjust] = useState({ scale: 1, fit: 'cover' });
  const [selectedElement, setSelectedElement] = useState(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [selectionRange, setSelectionRange] = useState(null);
  
  const certificateRef = useRef(null);
  const toolbarRef = useRef(null);

  const [elements, setElements] = useState({
    title: { 
      text: 'Certificate of Completion', 
      position: { x: 200, y: 80 },
      style: { ...defaultStyles, fontSize: 36, fontWeight: 'bold', color: '#1a237e' }
    },
    intro: { 
      text: 'This is to certify that', 
      position: { x: 250, y: 160 },
      style: { ...defaultStyles, fontSize: 20, color: '#424242' }
    },
    name: { 
      text: 'John Doe', 
      position: { x: 280, y: 200 },
      style: { ...defaultStyles, fontSize: 32, fontWeight: 'bold', color: '#2c3e50' }
    },
    paragraph: { 
      text: 'has successfully completed the course', 
      position: { x: 220, y: 260 },
      style: { ...defaultStyles, fontSize: 20, color: '#424242' }
    },
    course: { 
      text: 'React JS Masterclass', 
      position: { x: 240, y: 300 },
      style: { ...defaultStyles, fontSize: 28, fontWeight: 'bold', color: '#1976d2' }
    },
    date: { 
      text: 'on July 26, 2025', 
      position: { x: 260, y: 360 },
      style: { ...defaultStyles, fontSize: 18, color: '#616161' }
    },
    issuer: { 
      text: 'Issued by: Your Institute', 
      position: { x: 280, y: 420 },
      style: { ...defaultStyles, fontSize: 16, color: '#757575' }
    },
  });

  useEffect(() => {
    const savedBorder = localStorage.getItem('certificateBorder');
    if (savedBorder) setBorderImage(savedBorder);
  }, []);

  const handleDrag = useCallback((key, e, data) => {
    setElements((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        position: { x: data.x, y: data.y },
      },
    }));
  }, []);

  const handleTextChange = useCallback((key, e) => {
    setElements((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        text: e.target.value,
      },
    }));
  }, []);

  const handleElementClick = useCallback((key) => {
    setSelectedElement(key);
  }, []);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const certificateRect = certificateRef.current?.getBoundingClientRect();
      
      if (certificateRect) {
        const top = rect.top - certificateRect.top - 50;
        const left = rect.left - certificateRect.left + (rect.width / 2);
        
        setToolbarPosition({ top, left });
        setSelectionRange(range);
        setShowToolbar(true);
      }
    } else {
      setShowToolbar(false);
      setSelectionRange(null);
    }
  }, []);

  const handleToolbarAction = useCallback((action, value) => {
    if (selectionRange) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(selectionRange);
      
      switch (action) {
        case 'bold':
          document.execCommand('bold', false, null);
          break;
        case 'italic':
          document.execCommand('italic', false, null);
          break;
        case 'underline':
          document.execCommand('underline', false, null);
          break;
        case 'fontSize':
          document.execCommand('fontSize', false, value);
          break;
        case 'fontFamily':
          document.execCommand('fontName', false, value);
          break;
        case 'foreColor':
          document.execCommand('foreColor', false, value);
          break;
        default:
          break;
      }
      
      setShowToolbar(false);
      setSelectionRange(null);
    }
  }, [selectionRange]);

  const handleMouseUp = useCallback(() => {
    setTimeout(handleTextSelection, 10);
  }, [handleTextSelection]);

  const handleClickOutside = useCallback((e) => {
    if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
      setShowToolbar(false);
      setSelectionRange(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <Box className="certificate-container">
      <Grid container justifyContent="center" alignItems="center" spacing={4} wrap="wrap">
        <Grid item xs={12} md={8} lg={7}>
          <Paper
            elevation={8}
            className="certificate-paper"
            sx={{
              width: `${700 * borderAdjust.scale}px`,
              height: `${500 * borderAdjust.scale}px`,
              maxWidth: '100%',
              minWidth: 400,
              mx: 'auto',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
              background: borderImage ? `url(${borderImage})` : '#fff',
              backgroundSize: borderAdjust.fit,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
            ref={certificateRef}
            onMouseUp={handleMouseUp}
          >
            {Object.entries(elements).map(([key, element]) => (
              <Draggable
                key={key}
                position={element.position}
                onStop={(e, data) => handleDrag(key, e, data)}
                bounds="parent"
              >
                <div
                  className={`draggable-text ${selectedElement === key ? 'selected' : ''}`}
                  style={{
                    width: 'auto',
                    maxWidth: '80%',
                    minWidth: '100px',
                    ...element.style,
                  }}
                  onClick={() => handleElementClick(key)}
                >
                  <ContentEditable
                    html={element.text}
                    onChange={(e) => handleTextChange(key, e)}
                    tagName="div"
                    className="content-editable"
                    onMouseUp={handleMouseUp}
                  />
                </div>
              </Draggable>
            ))}

            {showToolbar && (
              <FloatingToolbar
                position={toolbarPosition}
                onAction={handleToolbarAction}
                visible={showToolbar}
                ref={toolbarRef}
              />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4} lg={3}>
          <CustomizationPanel 
            onStyleChange={setStyles} 
            onBorderAdjust={setBorderAdjust}
            selectedElement={selectedElement}
            elements={elements}
            setElements={setElements}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CertificatePreview;
