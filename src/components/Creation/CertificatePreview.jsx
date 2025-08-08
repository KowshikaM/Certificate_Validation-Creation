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
  Divider,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { 
  ArrowBack,
  Download,
  Print,
  Share,
  FormatBold,
  FormatItalic,
  FormatUnderline,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  DragIndicator,
  Settings,
  ZoomIn,
  ZoomOut,
  Edit // <-- add this
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Draggable from 'react-draggable';
import ContentEditable from 'react-contenteditable';
import html2canvas from 'html2canvas'; // <-- add this import

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
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    animation: 'float 20s ease-in-out infinite',
  },
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-20px)' },
  },
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

const DraggableText = styled(Box)(({ theme, selected, isName, isSeal }) => ({
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
  ...(isName && {
    border: '2px solid #1976d2',
    borderRadius: '4px',
    padding: '8px 16px',
    backgroundColor: 'rgba(25, 118, 210, 0.05)',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      right: '-2px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '2px',
      height: '20px',
      backgroundColor: '#1976d2',
      animation: 'blink 1s infinite',
    },
    '@keyframes blink': {
      '0%, 50%': { opacity: 1 },
      '51%, 100%': { opacity: 0 },
    }
  }),
  ...(isSeal && {
    width: '60px',
    height: '60px',
    backgroundColor: '#00838f',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      width: '40px',
      height: '40px',
      backgroundColor: '#00838f',
      borderRadius: '50%',
      border: '3px solid white',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-15px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '2px',
      height: '20px',
      backgroundColor: '#00838f',
    },
    '& .content-editable': {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '12px',
      zIndex: 1,
      position: 'relative',
    }
  }),
}));

const CertificatePreview = () => {
  const navigate = useNavigate();
  const [certificateData, setCertificateData] = useState(null);
  const [borderImage, setBorderImage] = useState('');
  const [certificateSize, setCertificateSize] = useState('A4-Horizontal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isEditing, setIsEditing] = useState(true); // <-- add this
  const certificateRef = useRef(null); // <-- add this ref

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
        seal: { x: dimensions.width * 0.8, y: dimensions.height * 0.5 - 30 },
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
        seal: { x: dimensions.width * 0.8, y: dimensions.height * 0.6 },
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

  const [isSaved, setIsSaved] = useState(false);
  
  // Watermark state for download
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkHash, setWatermarkHash] = useState('');
  const [watermarkPattern, setWatermarkPattern] = useState('');



  useEffect(() => {
    const savedData = localStorage.getItem('certificateData');
    const savedBorder = localStorage.getItem('certificateBorder');
    const savedSize = localStorage.getItem('certificateSize');
    
    console.log('Loading certificate data:', savedData);
    console.log('Loading border image:', savedBorder);
    console.log('Loading certificate size:', savedSize);
    
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
      console.log('Setting border image:', savedBorder);
      setBorderImage(savedBorder);
    }

    if (savedSize) {
      console.log('Setting certificate size:', savedSize);
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

  const handleSave = async () => { // <-- make async
    // Save current certificate state
    const certificateState = {
      elements,
      certificateSize,
      borderImage,
      certificateData
    };
    localStorage.setItem('certificateState', JSON.stringify(certificateState));
    setIsSaved(true);
    setIsEditing(false); // <-- disable editing
    // Show saved message briefly
    setTimeout(() => setIsSaved(false), 2000);
    // Trigger download after save
    await handleDownload();
  };



  // SHA-256 encryption function
  const sha256 = async (message) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
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

  const drawCertificateContent = (ctx, dimensions) => {
    // Draw all text elements
    Object.entries(elements).forEach(([key, element]) => {
      if (key === 'seal') return; // Skip seal for now
      
      ctx.font = `${element.style.fontWeight === 'bold' ? 'bold' : 'normal'} ${element.style.fontSize} ${element.style.fontFamily}`;
      ctx.fillStyle = element.style.color;
      ctx.textAlign = element.style.textAlign || 'center';
      ctx.fillText(element.text, element.position.x, element.position.y);
    });
  };

  // Function to sample background color at a specific position in canvas
  const sampleCanvasBackgroundColor = (ctx, x, y) => {
    try {
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

  const drawWatermark = (ctx, dimensions, pattern) => {
    if (!pattern) return;
    
    // Draw watermark with stealth color blending
    ctx.font = '12px "Courier New", "Monaco", "Consolas", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    pattern.forEach((item) => {
        // Sample the background color at this position
        const bgColor = sampleCanvasBackgroundColor(ctx, item.x, item.y);
        const stealthColor = blendWithBackground(bgColor, 0.995);
        
        // Set the stealth color with very high opacity for maximum stealth
        ctx.fillStyle = `rgba(${stealthColor.r}, ${stealthColor.g}, ${stealthColor.b}, ${stealthColor.a / 255})`;
        
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate((item.rotation * Math.PI) / 180);
      ctx.fillText(item.char, 0, 0);
      ctx.restore();
    });
  };

  const downloadCanvas = (canvas) => {
    try {
      const link = document.createElement('a');
      link.download = `certificate_${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      setIsGenerating(false);
      console.log('Certificate downloaded with watermark');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Certificate of Completion',
        text: 'Check out my certificate!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#000000' }}>
                Certificate Designer
              </Typography>
            </Box>
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
                          {isSaved ? '✓ Saved' : 'Save & Download'}
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
                    </Box>
                  </CardContent>
                </Card>

                <Card sx={{ mt: 3, borderRadius: 3, background: '#f8f9fa' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#000000' }}>
                     Designer Tips
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" sx={{ color: '#000000' }}>
                        • Click and drag text elements to reposition
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#000000' }}>
                        • Double-click text to edit content
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#000000' }}>
                        • Use zoom controls for precise editing
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#000000' }}>
                        • Save your progress before downloading
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>

            {/* Right Panel - Certificate Preview */}
            <Grid item xs={12} lg={8}>
              <Box sx={{ textAlign: 'center' }}>
                {/* Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                  <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, fontSize: '12px' }}>
                    <Typography variant="body2">
                      Debug Info: Border Image = {borderImage || 'None'}, 
                      Certificate Data = {certificateData ? 'Loaded' : 'Not Found'},
                      Size = {certificateSize}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  minHeight: '600px',
                  overflow: 'auto',
                  p: 2,
                  maxHeight: '70vh',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#667eea',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: '#5a6fd8',
                  },
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
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      borderRadius: 3,
                      border: '2px solid #e0e0e0',
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                      backgroundColor: borderImage ? 'transparent' : '#fff',
                      '&::before': borderImage ? {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        zIndex: 0,
                      } : {},
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
                          border: '3px solid #667eea',
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
                            isName={key === 'name'}
                            // isSeal={key === 'seal'} // REMOVE this
                            onClick={() => handleElementClick(key)}
                            sx={{
                              zIndex: 1,
                              position: 'absolute',
                              // REMOVE left: element.position.x, top: element.position.y here!
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