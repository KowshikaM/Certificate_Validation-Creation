import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Watermark from './Watermark';
import { 
  Box, 
  Paper, 
  Button, 
  Typography, 
  Container,
  Grid,
  Card,
  CardContent,
  IconButton,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { 
  ArrowBack,
  Download,
  DragIndicator,
  Settings,
  ZoomIn,
  ZoomOut,
  Edit,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Draggable from 'react-draggable';
import ContentEditable from 'react-contenteditable';
import html2canvas from 'html2canvas';

// SHA-256 encryption function
const sha256 = async (message) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const StyledContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 24,
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  position: 'relative',
  zIndex: 1,
  animation: 'slideUp 0.6s ease-out',
  '@keyframes slideUp': {
    from: {
      opacity: 0,
      transform: 'translateY(30px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

const DraggableText = styled(Box)(({ theme, selected }) => ({
  position: 'absolute',
  cursor: 'move',
  userSelect: 'none',
  minWidth: '50px',
  minHeight: '20px',
  padding: selected ? '4px' : '2px',
  border: selected ? '2px dashed #667eea' : '2px solid transparent',
  borderRadius: selected ? '4px' : '0',
  backgroundColor: selected ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
  '&:hover': {
    border: '2px dashed #667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
  '& .content-editable': {
    outline: 'none',
    cursor: 'text',
    minHeight: '20px',
    '&:focus': {
      outline: 'none',
    },
  },
}));

const CertificatePreview = () => {
  const navigate = useNavigate();
  const [certificateData, setCertificateData] = useState(null);
  const [borderImage, setBorderImage] = useState('');
  const [certificateSize, setCertificateSize] = useState('A4-Horizontal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isEditing, setIsEditing] = useState(true);
  const certificateRef = useRef(null);

  // Bulk generation state
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Watermark state for download
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkHash, setWatermarkHash] = useState('');
  const [watermarkPattern, setWatermarkPattern] = useState('');

  // Define certificate dimensions based on size
  const getCertificateDimensions = (size) => {
    const dimensions = {
      'A4-Horizontal': { width: 800, height: 600 },
      'A4-Vertical': { width: 600, height: 800 },
      'A3-Horizontal': { width: 1000, height: 700 },
      'A3-Vertical': { width: 700, height: 1000 }
    };
    return dimensions[size] || dimensions['A4-Horizontal'];
  };

  // Adjust element positions based on certificate size
  const getElementPositions = (size) => {
    const dimensions = getCertificateDimensions(size);
    const isHorizontal = size.includes('Horizontal');
    
    if (isHorizontal) {
      return {
        title: { x: (dimensions.width - 400) / 2, y: 60 },
        intro: { x: (dimensions.width - 300) / 2, y: 140 },
        name: { x: (dimensions.width - 200) / 2, y: 180 },
        paragraph: { x: (dimensions.width - 400) / 2, y: 240 },
        course: { x: (dimensions.width - 300) / 2, y: 280 },
        date: { x: (dimensions.width - 200) / 2, y: 340 },
        issuer: { x: (dimensions.width - 240) / 2, y: 380 },
      };
    } else {
      return {
        title: { x: (dimensions.width - 400) / 2, y: 80 },
        intro: { x: (dimensions.width - 300) / 2, y: 180 },
        name: { x: (dimensions.width - 200) / 2, y: 240 },
        paragraph: { x: (dimensions.width - 400) / 2, y: 320 },
        course: { x: (dimensions.width - 300) / 2, y: 380 },
        date: { x: (dimensions.width - 200) / 2, y: 440 },
        issuer: { x: (dimensions.width - 240) / 2, y: 500 },
      };
    }
  };

  const [elements, setElements] = useState({
    title: {
      text: 'Certificate of Completion',
      position: { x: 200, y: 60 },
      style: { 
        fontSize: 40, 
        fontWeight: 'bold', 
        color: '#1a237e',
        fontFamily: 'Roboto, sans-serif',
        textAlign: 'center'
      }
    },
    intro: {
      text: 'This is to certify that',
      position: { x: 250, y: 140 },
      style: { 
        fontSize: 24, 
        color: '#424242',
        fontFamily: 'Roboto, sans-serif',
        textAlign: 'center'
      }
    },
    name: {
      text: 'John Doe',
      position: { x: 300, y: 180 },
      style: { 
        fontSize: 32, 
        fontWeight: 'bold', 
        color: '#2c3e50',
        fontFamily: 'Roboto, sans-serif',
        textAlign: 'center'
      }
    },
    paragraph: {
      text: 'has successfully completed the course',
      position: { x: 200, y: 240 },
      style: { 
        fontSize: 24, 
        color: '#424242',
        fontFamily: 'Roboto, sans-serif',
        textAlign: 'center'
      }
    },
    course: {
      text: 'React JS Masterclass',
      position: { x: 250, y: 280 },
      style: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: '#1976d2',
        fontFamily: 'Roboto, sans-serif',
        textAlign: 'center'
      }
    },
    date: {
      text: 'on July 26, 2025',
      position: { x: 300, y: 340 },
      style: { 
        fontSize: 20, 
        color: '#616161',
        fontFamily: 'Roboto, sans-serif',
        textAlign: 'center'
      }
    },
    issuer: {
      text: 'Issued by: Your Institute',
      position: { x: 280, y: 380 },
      style: { 
        fontSize: 18, 
        color: '#757575',
        fontFamily: 'Roboto, sans-serif',
        textAlign: 'center'
      }
    }
  });

  useEffect(() => {
    const savedData = localStorage.getItem('certificateData');
    const savedBorder = localStorage.getItem('certificateBorder');
    const savedSize = localStorage.getItem('certificateSize');
    
    // Check if we're in bulk mode
    const bulkModeActive = sessionStorage.getItem('bulkMode') === 'true';
    setBulkMode(bulkModeActive);
    
    if (savedData) {
      const data = JSON.parse(savedData);
      setCertificateData(data);
      
      // Update elements with the saved certificate data
      setElements(prev => ({
        ...prev,
        title: { ...prev.title, text: data.certificateTitle || 'Certificate of Completion' },
        name: { ...prev.name, text: data.name || 'John Doe' },
        course: { ...prev.course, text: data.course || 'React JS Masterclass' },
        date: { ...prev.date, text: `on ${data.date || 'July 26, 2025'}` },
        issuer: { ...prev.issuer, text: `Issued by: ${data.issuer || 'Your Institute'}` },
        paragraph: { ...prev.paragraph, text: data.paragraph || 'has successfully completed the course' },
      }));
    }
    
    if (savedBorder) {
      setBorderImage(savedBorder);
    }

    if (savedSize) {
      setCertificateSize(savedSize);
      
      // Update element positions based on the certificate size
      const newPositions = getElementPositions(savedSize);
      setElements(prev => {
        const updatedElements = { ...prev };
        Object.keys(newPositions).forEach(key => {
          if (updatedElements[key]) {
            updatedElements[key] = {
              ...updatedElements[key],
              position: newPositions[key]
            };
          }
        });
        return updatedElements;
      });
    }
  }, []);

  // Update element positions when certificate size changes
  useEffect(() => {
    if (certificateSize) {
      const newPositions = getElementPositions(certificateSize);
      setElements(prev => {
        const updatedElements = { ...prev };
        Object.keys(newPositions).forEach(key => {
          if (updatedElements[key]) {
            updatedElements[key] = {
              ...updatedElements[key],
              position: newPositions[key]
            };
          }
        });
        return updatedElements;
      });
    }
  }, [certificateSize]);

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

  const updateElementStyle = (key, property, value) => {
    setElements(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        style: {
          ...prev[key].style,
          [property]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    // Save current certificate state
    const certificateState = {
      elements,
      certificateSize,
      borderImage,
      certificateData
    };
    localStorage.setItem('certificateState', JSON.stringify(certificateState));
    setIsSaved(true);
    setIsEditing(false);
    // Show saved message briefly
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleBulkGenerate = async () => {
    if (!bulkMode) {
      alert('No bulk file found. Please go back to bulk upload and try again.');
      return;
    }

    setIsBulkGenerating(true);
    try {
      // Build a compact layout object consumed by backend PDF builder
      const compactElements = {};
      Object.entries(elements).forEach(([key, el]) => {
        compactElements[key] = {
          position: el.position,
          style: el.style,
        };
      });
      
      // Get border information - avoid converting to base64 to prevent large requests
      const borderSrc = localStorage.getItem('certificateBorder') || '';
      let borderAbsolute = '';
      if (borderSrc) {
        borderAbsolute = /^https?:/i.test(borderSrc)
          ? borderSrc
          : `${window.location.origin}${borderSrc.startsWith('/') ? '' : '/'}${borderSrc}`;
      }

      // Create a lightweight layout object without large base64 data
      const layout = {
        elements: compactElements,
        borderImageUrl: borderSrc,
        borderImageUrlAbsolute: borderAbsolute,
        // Remove borderImageDataUrl to prevent large requests
        referenceDimensions: getCertificateDimensions(certificateSize),
      };

      // Get bulk file from session storage
      const bulkFileObjectUrl = sessionStorage.getItem('bulkFileObjectUrl');
      if (!bulkFileObjectUrl) {
        throw new Error('Bulk file not found. Please re-upload your file.');
      }

      // Rehydrate file from ObjectURL or from Base64 fallback
      let fileBlob;
      try {
        fileBlob = await (await fetch(bulkFileObjectUrl)).blob();
      } catch (_) {
        const b64 = sessionStorage.getItem('bulkFileBase64');
        if (!b64) throw new Error('Bulk dataset missing. Please re-upload.');
        const byteChars = atob(b64);
        const byteNums = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
        const byteArray = new Uint8Array(byteNums);
        fileBlob = new Blob([byteArray], { type: 'application/octet-stream' });
      }

      // Check file size before sending (limit to 50MB to be safe)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (fileBlob.size > maxSize) {
        throw new Error(`File size (${(fileBlob.size / 1024 / 1024).toFixed(1)}MB) exceeds the maximum allowed size of 50MB. Please use a smaller file.`);
      }
      
      const fileName = sessionStorage.getItem('bulkFileName') || 'bulk.csv';
      const form = new FormData();
      form.append('file', fileBlob, fileName);
      form.append('layout', JSON.stringify(layout));

      console.log('Sending bulk generation request with layout:', layout);
      console.log('File size:', (fileBlob.size / 1024 / 1024).toFixed(2), 'MB');

      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';
      const res = await fetch(`${apiBaseUrl}/bulk_generate`, { method: 'POST', body: form });
      
      if (!res.ok) {
        const text = await res.text();
        console.error('Bulk generation failed with status:', res.status, 'Response:', text);
        throw new Error(`Bulk generation failed: ${text}`);
      }
      
      // Download the ZIP file
      const zipBlob = await res.blob();
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      const ts = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const stamp = `${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}`;
      a.download = `certificates_${stamp}.zip`;
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      // Show success message
      alert(`Successfully generated and downloaded all certificates!`);
      
    } catch (e) {
      console.error('Bulk generation error:', e);
      alert(`Error generating certificates: ${e.message}`);
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      if (certificateRef.current) {
        // Generate SHA-256 hash of userName for watermark
        const recipientName = certificateData?.name || elements?.name?.text || 'John Doe';
        const hash = await sha256(recipientName);
        
        // Randomly select a watermark pattern
        const patterns = ['border-continuous', 'horizontal-center', 'vertical-center', 'cross-pattern', 'diagonal-lines', 'l-shaped', 't-shaped', 'corner-focus'];
        const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        // Set watermark state to show it during download
        setWatermarkHash(hash);
        setWatermarkPattern(randomPattern);
        setShowWatermark(true);
        
        // Wait a tick to ensure watermark is rendered
        await new Promise((resolve) => setTimeout(resolve, 100));
        
        // Capture the certificate with watermark
        const canvas = await html2canvas(certificateRef.current, {
          useCORS: true,
          backgroundColor: null,
          scale: 2,
        });
        
        // Remove watermark from DOM immediately after capture
        setShowWatermark(false);
        setWatermarkHash('');
        setWatermarkPattern('');
        
        // Download the image
        const link = document.createElement('a');
        link.download = `certificate_${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (error) {
      console.error('Error capturing certificate:', error);
      // Ensure watermark is removed even if error occurs
      setShowWatermark(false);
      setWatermarkHash('');
      setWatermarkPattern('');
    }
    setIsGenerating(false);
  };

  if (!certificateData) {
    return (
      <StyledContainer>
        <Container maxWidth="md">
          <StyledPaper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              No certificate data found
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/creation/size')}
              sx={{ mt: 2 }}
            >
              Start Creating
            </Button>
          </StyledPaper>
        </Container>
      </StyledContainer>
    );
  }

  const selectedElementData = selectedElement ? elements[selectedElement] : null;

  return (
    <StyledContainer>
      <Container maxWidth="xl">
        <StyledPaper sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#000000' }}>
              Certificate Designer
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, mb: 3, color: '#000000' }}>
              Drag, edit, and customize your certificate in real-time
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Left Panel - Controls */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ position: 'sticky', top: 20 }}>
                <Card sx={{ mb: 3, borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2d3748' }}>
                      <DragIndicator sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Text Elements
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {Object.keys(elements).map((key) => (
                        <Button
                          key={key}
                          variant={selectedElement === key ? 'contained' : 'outlined'}
                          size="small"
                          onClick={() => setSelectedElement(key)}
                          sx={{
                            justifyContent: 'flex-start',
                            textTransform: 'none',
                            backgroundColor: selectedElement === key ? '#667eea' : 'transparent',
                            '&:hover': {
                              backgroundColor: selectedElement === key ? '#5a6fd8' : 'rgba(102, 126, 234, 0.04)',
                            }
                          }}
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Button>
                      ))}
                    </Box>
                  </CardContent>
                </Card>

                {selectedElementData && (
                  <Card sx={{ mb: 3, borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2d3748' }}>
                        <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Text Properties
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Font Size: {selectedElementData.style.fontSize}px
                          </Typography>
                          <Slider
                            value={parseInt(selectedElementData.style.fontSize)}
                            onChange={(e, value) => updateElementStyle(selectedElement, 'fontSize', value + 'px')}
                            min={12}
                            max={72}
                            sx={{ color: '#667eea' }}
                          />
                        </Box>

                        <FormControl fullWidth size="small">
                          <InputLabel>Font Family</InputLabel>
                          <Select
                            value={selectedElementData.style.fontFamily?.split(',')[0] || 'Roboto'}
                            onChange={(e) => updateElementStyle(selectedElement, 'fontFamily', e.target.value + ', sans-serif')}
                            label="Font Family"
                          >
                            <MenuItem value="Roboto">Roboto</MenuItem>
                            <MenuItem value="Poppins">Poppins</MenuItem>
                            <MenuItem value="Inter">Inter</MenuItem>
                            <MenuItem value="Open Sans">Open Sans</MenuItem>
                            <MenuItem value="Lato">Lato</MenuItem>
                            <MenuItem value="Montserrat">Montserrat</MenuItem>
                            <MenuItem value="Playfair Display">Playfair Display</MenuItem>
                          </Select>
                        </FormControl>

                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Text Color
                          </Typography>
                          <input
                            type="color"
                            value={selectedElementData.style.color}
                            onChange={(e) => updateElementStyle(selectedElement, 'color', e.target.value)}
                            style={{ width: '100%', height: 40, borderRadius: 4, border: '1px solid #ddd' }}
                          />
                        </Box>

                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Text Alignment
                          </Typography>
                          <ToggleButtonGroup
                            value={selectedElementData.style.textAlign || 'center'}
                            exclusive
                            onChange={(e, value) => value && updateElementStyle(selectedElement, 'textAlign', value)}
                            size="small"
                          >
                            <ToggleButton value="left">
                              <FormatAlignLeft />
                            </ToggleButton>
                            <ToggleButton value="center">
                              <FormatAlignCenter />
                            </ToggleButton>
                            <ToggleButton value="right">
                              <FormatAlignRight />
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </Box>

                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Font Weight
                          </Typography>
                          <ToggleButtonGroup
                            value={selectedElementData.style.fontWeight || 'normal'}
                            exclusive
                            onChange={(e, value) => value && updateElementStyle(selectedElement, 'fontWeight', value)}
                            size="small"
                          >
                            <ToggleButton value="normal">Normal</ToggleButton>
                            <ToggleButton value="bold">Bold</ToggleButton>
                          </ToggleButtonGroup>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Actions Card */}
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2d3748' }}>
                      Actions
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {isEditing ? (
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={handleSave}
                          disabled={isSaved}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            py: 1.5,
                            borderColor: isSaved ? '#4caf50' : '#667eea',
                            color: isSaved ? '#4caf50' : '#667eea',
                            '&:hover': {
                              borderColor: isSaved ? '#45a049' : '#5a6fd8',
                              backgroundColor: isSaved ? 'rgba(76, 175, 80, 0.04)' : 'rgba(102, 126, 234, 0.04)',
                            }
                          }}
                        >
                          {isSaved ? '✓ Saved' : 'Save Layout'}
                        </Button>
                      ) : (
                        <IconButton
                          color="primary"
                          onClick={() => setIsEditing(true)}
                          sx={{ alignSelf: 'center', border: '1px solid #667eea', borderRadius: 2 }}
                        >
                          <Edit />
                        </IconButton>
                      )}

                      {/* Bulk Generation Button - Only show when in bulk mode and layout is saved */}
                      {bulkMode && !isEditing && (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={handleBulkGenerate}
                          disabled={isBulkGenerating}
                          startIcon={<Download />}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            py: 1.5,
                            backgroundColor: '#4caf50',
                            '&:hover': {
                              backgroundColor: '#45a049',
                            },
                            '&:disabled': {
                              backgroundColor: '#cccccc',
                            }
                          }}
                        >
                          {isBulkGenerating ? 'Generating...' : 'Download All Certificates'}
                        </Button>
                      )}

                      {/* Single Certificate Download Button - Only show when not in bulk mode */}
                      {!bulkMode && !isEditing && (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={handleDownload}
                          disabled={isGenerating}
                          startIcon={<Download />}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            py: 1.5,
                            backgroundColor: '#667eea',
                            '&:hover': {
                              backgroundColor: '#5a6fd8',
                            }
                          }}
                        >
                          {isGenerating ? 'Generating...' : 'Download Certificate'}
                        </Button>
                      )}

                      {/* Bulk Mode Indicator */}
                      {bulkMode && (
                        <Box sx={{ 
                          p: 2, 
                          backgroundColor: '#e8f5e8', 
                          borderRadius: 2, 
                          border: '1px solid #4caf50',
                          textAlign: 'center'
                        }}>
                          <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 500 }}>
                            📁 Bulk Mode Active
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#388e3c' }}>
                            Save your layout first, then download all certificates
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>

            {/* Right Panel - Certificate Preview */}
            <Grid item xs={12} lg={8}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  minHeight: '600px',
                  overflow: 'auto',
                  p: 2,
                  maxHeight: '70vh',
                }}>
                  <Paper
                    ref={certificateRef}
                    data-certificate-preview="true"
                    elevation={8}
                    sx={{
                      width: getCertificateDimensions(certificateSize).width,
                      height: getCertificateDimensions(certificateSize).height,
                      position: 'relative',
                      overflow: 'hidden',
                      background: borderImage ? `url(${borderImage})` : '#fff',
                      backgroundSize: '100% 100%',
                      backgroundPosition: 'left top',
                      backgroundRepeat: 'no-repeat',
                      borderRadius: 3,
                      border: '2px solid #e0e0e0',
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                      backgroundColor: borderImage ? 'transparent' : '#fff',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      flexShrink: 0,
                    }}
                  >
                    {/* Fallback border if no image is selected */}
                    {!borderImage && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          border: '12px solid #667eea',
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #f8faff 0%, #e8f2ff 100%)',
                          zIndex: 0,
                        }}
                      />
                    )}
                    
                    {/* Watermark component - only shown during download */}
                    {showWatermark && (
                      <Watermark 
                        userName={certificateData?.name || elements?.name?.text || 'John Doe'}
                        pattern={watermarkPattern}
                        hash={watermarkHash}
                        certificateSize={certificateSize}
                      />
                    )}
                    
                    {Object.entries(elements).map(([key, element]) => (
                      isEditing ? (
                        <Draggable
                          key={key}
                          position={element.position}
                          onStop={(e, data) => handleDrag(key, e, data)}
                          bounds="parent"
                          disabled={!isEditing}
                        >
                          <DraggableText
                            selected={selectedElement === key}
                            onClick={() => handleElementClick(key)}
                            sx={{
                              zIndex: 1,
                              position: 'absolute',
                              pointerEvents: isEditing ? 'auto' : 'none',
                            }}
                          >
                            <ContentEditable
                              html={element.text}
                              onChange={(e) => handleTextChange(key, e)}
                              tagName="div"
                              className="content-editable"
                              disabled={!isEditing}
                              style={{
                                ...element.style,
                                textShadow: borderImage ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                                backgroundColor: borderImage ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
                                padding: borderImage ? '4px 8px' : '0',
                                borderRadius: borderImage ? '4px' : '0',
                                pointerEvents: isEditing ? 'auto' : 'none',
                              }}
                            />
                          </DraggableText>
                        </Draggable>
                      ) : (
                        <Box
                          key={key}
                          sx={{
                            position: 'absolute',
                            left: element.position.x,
                            top: element.position.y,
                            zIndex: 1,
                            fontSize: element.style.fontSize,
                            fontWeight: element.style.fontWeight,
                            color: element.style.color,
                            fontFamily: element.style.fontFamily,
                            textAlign: element.style.textAlign,
                            backgroundColor: 'transparent',
                            border: 'none',
                            boxShadow: 'none',
                            padding: 0,
                            m: 0,
                            userSelect: 'none',
                            pointerEvents: 'none',
                            width: 'max-content',
                            maxWidth: '100%',
                            whiteSpace: 'pre-line',
                          }}
                          dangerouslySetInnerHTML={{ __html: element.text }}
                        />
                      )
                    ))}
                  </Paper>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <IconButton onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}>
                    <ZoomOut />
                  </IconButton>
                  <Typography variant="body2" sx={{ alignSelf: 'center', minWidth: 60 }}>
                    {Math.round(zoom * 100)}%
                  </Typography>
                  <IconButton onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                    <ZoomIn />
                  </IconButton>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Certificate Size: {certificateSize} ({getCertificateDimensions(certificateSize).width} × {getCertificateDimensions(certificateSize).height})
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/creation/border')}
              startIcon={<ArrowBack />}
              sx={{ 
                borderRadius: 12,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#5a6fd8',
                  backgroundColor: 'rgba(102, 126, 234, 0.04)',
                }
              }}
            >
              Back to Border
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              sx={{ 
                borderRadius: 12,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#5a6fd8',
                  backgroundColor: 'rgba(102, 126, 234, 0.04)',
                }
              }}
            >
              Back to Dashboard
            </Button>
          </Box>
        </StyledPaper>
      </Container>
    </StyledContainer>
  );
};

export default CertificatePreview;
