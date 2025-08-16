import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Card,
  CardContent,
  CardActionArea,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  ArrowBack,
  CheckCircle,
  Favorite,
  Star
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: '#f7fafd',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(60, 80, 120, 0.08)',
  background: '#f9f9fb',
  border: '1px solid #e5e7eb',
  maxWidth: 720,
  width: '100%',
  position: 'relative',
  zIndex: 1,
}));

const StyledCard = styled(Card)(({ theme, selected }) => ({
  borderRadius: 8,
  border: selected ? '1.5px solid #3a6ea5' : '1px solid #e0e0e0',
  background: selected ? '#f0f4fa' : '#fff',
  boxShadow: '0 1px 4px rgba(60, 80, 120, 0.06)',
  transition: 'box-shadow 0.18s, border 0.18s, background 0.18s',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'visible',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(60, 80, 120, 0.10)',
    background: selected ? '#e3ecfa' : '#f7fafd',
  },
  '& .MuiCardActionArea-root': {
    padding: theme.spacing(1.5),
  },
}));

const borders = [
  { 
    name: 'Modern Minimal', 
    file: '/borders/Border1.png',
    description: 'Clean and contemporary style with golden accents'
  },
  { 
    name: 'Golden Elegance', 
    file: '/borders/Border3.png',
    description: 'Sophisticated golden border with metallic finish'
  },
  { 
    name: 'Floral Beauty', 
    file: '/borders/Border4.png',
    description: 'Elegant floral motifs for special occasions'
  },
  { 
    name: 'Geometric Precision', 
    file: '/borders/Border5.png',
    description: 'Sharp lines and geometric patterns'
  },
  { 
    name: 'Vintage Charm', 
    file: '/borders/Border6.png',
    description: 'Classic vintage style with ornate details'
  },
  { 
    name: 'Corporate Professional', 
    file: '/borders/Border7.png',
    description: 'Professional design for business certificates'
  },
  { 
    name: 'Artistic Flair', 
    file: '/borders/Border8.png',
    description: 'Creative and artistic border design'
  },
  { 
    name: 'Luxury Premium', 
    file: '/borders/Border2.png',
    description: 'Premium luxury design for special achievements'
  },
  { 
    name: 'Classic Elegance', 
    file: '/borders/Border9.png',
    description: 'Timeless design with cream background, gold border, and red ribbons'
  },
];

const BorderPicker = () => {
  const navigate = useNavigate();
  const [selectedBorder, setSelectedBorder] = useState(null);

  const handleSelect = (file) => {
    setSelectedBorder(file);
    // Add a small delay for better UX
    setTimeout(() => {
      localStorage.setItem('certificateBorder', file);
      navigate('/creation/preview');
    }, 300);
  };

  return (
    <StyledContainer>
      <StyledPaper elevation={0}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#000000' }}>
              Choose Your Border Design
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 400, mb: 3, color: '#000000' }}>
            Select from our collection of beautiful border designs
          </Typography>
        </Box>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2.5,
          justifyContent: 'center',
          alignItems: 'center',
          mb: 3,
          maxWidth: 720,
          mx: 'auto',
        }}>
          {borders.map((border) => (
            <StyledCard
              key={border.file}
              selected={selectedBorder === border.file}
              elevation={0}
            >
              <CardActionArea onClick={() => handleSelect(border.file)}>
                <CardContent sx={{ textAlign: 'center', p: 0 }}>
                  <Box sx={{ position: 'relative', mb: 1.5 }}>
                    <img
                      src={border.file}
                      alt={border.name}
                      style={{
                        width: '100%',
                        height: 90,
                        objectFit: 'contain',
                        borderRadius: 6,
                        border: '1px solid #e0e0e0',
                      }}
                    />
                    {selectedBorder === border.file && (
                      <CheckCircle
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          color: '#3a6ea5',
                          fontSize: 22,
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          boxShadow: '0 1px 4px rgba(60, 80, 120, 0.10)',
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: '#2d3748', fontSize: '1.08rem' }}>
                    {border.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, fontSize: '0.97rem', color: '#000000', minHeight: 32 }}>
                    {border.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </StyledCard>
          ))}
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 2, color: '#000000' }}>
            💡 Tip: All borders are designed to work perfectly with your certificate content
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/creation/form')}
              startIcon={<ArrowBack />}
              sx={{ 
                borderRadius: 10,
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                py: 1.5,
                borderColor: '#3a6ea5',
                color: '#3a6ea5',
                '&:hover': {
                  borderColor: '#2c5a8a',
                  backgroundColor: 'rgba(58, 110, 165, 0.04)',
                }
              }}
            >
              Back to Form
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              sx={{ 
                borderRadius: 10,
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                py: 1.5,
                borderColor: '#3a6ea5',
                color: '#3a6ea5',
                '&:hover': {
                  borderColor: '#2c5a8a',
                  backgroundColor: 'rgba(58, 110, 165, 0.04)',
                }
              }}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Box>
      </StyledPaper>
    </StyledContainer>
  );
};

export default BorderPicker;
