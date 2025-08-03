import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AutoAwesome,
  FormatBold,
  FormatItalic,
  FormatUnderline,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  DragIndicator,
  Settings,
  ZoomIn,
  ZoomOut
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Draggable from 'react-draggable';
import ContentEditable from 'react-contenteditable';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [zoom, setZoom] = useState(1);

  const [elements, setElements] = useState({
    title: {
      text: 'Certificate of Completion',
      position: { x: 250, y: 60 },
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
      position: { x: 300, y: 140 },
      style: { 
        fontSize: 24, 
        color: '#424242',
        fontFamily: 'Roboto, sans-serif',
        textAlign: 'center'
      }
    },
    name: {
      text: 'John Doe',
      position: { x: 320, y: 180 },
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
      position: { x: 250, y: 240 },
      style: { 
        fontSize: 24, 
        color: '#424242',
        fontFamily: 'Roboto, sans-serif',
        textAlign: 'center'
      }
    },
    course: {
      text: 'React JS Masterclass',
      position: { x: 200, y: 280 },
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
    },
    seal: {
      text: 'SEAL',
      position: { x: 520, y: 280 },
      style: { 
        fontSize: 12, 
        fontWeight: 'bold',
        color: 'white',
        fontFamily: 'Roboto, sans-serif',
        textAlign: 'center'
      }
    },
  });

  useEffect(() => {
    const savedData = localStorage.getItem('certificateData');
    const savedBorder = localStorage.getItem('certificateBorder');
    
    if (savedData) {
      const data = JSON.parse(savedData);
      setCertificateData(data);
      
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

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      console.log('Downloading certificate...');
    }, 2000);
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
              <AutoAwesome sx={{ fontSize: 40, color: '#667eea', mr: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Certificate Designer
              </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 3 }}>
              Drag, edit, and customize your certificate in real-time
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} lg={8}>
              <Box sx={{ textAlign: 'center' }}>
                <Paper
                  elevation={8}
                  sx={{
                    width: '100%',
                    maxWidth: 800,
                    height: 600,
                    mx: 'auto',
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
                  }}
                >
                  {Object.entries(elements).map(([key, element]) => (
                    <Draggable
                      key={key}
                      position={element.position}
                      onStop={(e, data) => handleDrag(key, e, data)}
                      bounds="parent"
                    >
                      <DraggableText
                        selected={selectedElement === key}
                        isName={key === 'name'}
                        isSeal={key === 'seal'}
                        onClick={() => handleElementClick(key)}
                      >
                        <ContentEditable
                          html={element.text}
                          onChange={(e) => handleTextChange(key, e)}
                          tagName="div"
                          className="content-editable"
                          style={element.style}
                        />
                      </DraggableText>
                    </Draggable>
                  ))}
                </Paper>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <IconButton onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                    <ZoomOut />
                  </IconButton>
                  <Typography variant="body2" sx={{ alignSelf: 'center', minWidth: 60 }}>
                    {Math.round(zoom * 100)}%
                  </Typography>
                  <IconButton onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                    <ZoomIn />
                  </IconButton>
                </Box>
              </Box>
            </Grid>

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

                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2d3748' }}>
                      Actions
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Download />}
                        onClick={handleDownload}
                        disabled={isGenerating}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.5,
                          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                          }
                        }}
                      >
                        {isGenerating ? 'Generating...' : 'Download PDF'}
                      </Button>
                      
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Print />}
                        onClick={handlePrint}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.5,
                          borderColor: '#667eea',
                          color: '#667eea',
                          '&:hover': {
                            borderColor: '#5a6fd8',
                            backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          }
                        }}
                      >
                        Print Certificate
                      </Button>
                      
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Share />}
                        onClick={handleShare}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.5,
                          borderColor: '#667eea',
                          color: '#667eea',
                          '&:hover': {
                            borderColor: '#5a6fd8',
                            backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          }
                        }}
                      >
                        Share Certificate
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                <Card sx={{ mt: 3, borderRadius: 3, background: 'linear-gradient(135deg, #f8faff 0%, #e8f2ff 100%)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2d3748' }}>
                      💡 Designer Tips
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        • Click and drag text elements to reposition
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Double-click text to edit content
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Use zoom controls for precise editing
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
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