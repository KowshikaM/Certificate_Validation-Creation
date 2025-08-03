import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Card, 
  CardContent,
  CardActionArea,
  Chip,
  IconButton
} from '@mui/material';
import { 
  ArrowForward, 
  CheckCircle,
  CropSquare,
  CropPortrait,
  AutoAwesome
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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
  padding: theme.spacing(4),
  borderRadius: 24,
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  maxWidth: 800,
  width: '100%',
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

const StyledCard = styled(Card)(({ theme, selected }) => ({
  borderRadius: 16,
  border: selected ? '3px solid #667eea' : '2px solid #e0e0e0',
  background: selected ? 'linear-gradient(135deg, #f8faff 0%, #e8f2ff 100%)' : '#ffffff',
  boxShadow: selected 
    ? '0 8px 25px rgba(102, 126, 234, 0.2)' 
    : '0 4px 12px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'visible',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)',
  },
  '& .MuiCardActionArea-root': {
    padding: theme.spacing(3),
  },
}));

const SizeSelector = () => {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(null);

  const sizeOptions = [
    {
      id: 'A4-Horizontal',
      name: 'A4 Horizontal',
      dimensions: '297 × 210 mm',
      description: 'Perfect for landscape certificates',
      icon: <CropSquare sx={{ fontSize: 40, color: '#667eea' }} />,
      popular: true
    },
    {
      id: 'A4-Vertical',
      name: 'A4 Vertical',
      dimensions: '210 × 297 mm',
      description: 'Classic portrait layout',
      icon: <CropPortrait sx={{ fontSize: 40, color: '#667eea' }} />,
      popular: false
    },
    {
      id: 'A3-Horizontal',
      name: 'A3 Horizontal',
      dimensions: '420 × 297 mm',
      description: 'Large format for special occasions',
      icon: <CropSquare sx={{ fontSize: 40, color: '#667eea' }} />,
      popular: false
    },
    {
      id: 'A3-Vertical',
      name: 'A3 Vertical',
      dimensions: '297 × 420 mm',
      description: 'Premium portrait certificates',
      icon: <CropPortrait sx={{ fontSize: 40, color: '#667eea' }} />,
      popular: false
    }
  ];

  const handleSelect = (size) => {
    setSelectedSize(size);
    // Add a small delay for better UX
    setTimeout(() => {
      localStorage.setItem('certificateSize', size);
      navigate('/creation/form');
    }, 300);
  };

  return (
    <StyledContainer>
      <StyledPaper elevation={0}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <AutoAwesome sx={{ fontSize: 40, color: '#667eea', mr: 1 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Choose Certificate Size
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            Select the perfect size for your certificate
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
          gap: 3,
          mb: 4
        }}>
          {sizeOptions.map((option) => (
            <StyledCard 
              key={option.id} 
              selected={selectedSize === option.id}
              elevation={0}
            >
              <CardActionArea onClick={() => handleSelect(option.id)}>
                <CardContent sx={{ textAlign: 'center', p: 0 }}>
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    {option.icon}
                    {selectedSize === option.id && (
                      <CheckCircle 
                        sx={{ 
                          position: 'absolute', 
                          top: -10, 
                          right: -10, 
                          color: '#667eea',
                          fontSize: 30,
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          animation: 'bounce 0.6s ease-out'
                        }} 
                      />
                    )}
                  </Box>
                  
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2d3748' }}>
                    {option.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {option.dimensions}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {option.description}
                  </Typography>
                  
                  {option.popular && (
                    <Chip 
                      label="Most Popular" 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#667eea', 
                        color: 'white',
                        fontWeight: 600
                      }} 
                    />
                  )}
                </CardContent>
              </CardActionArea>
            </StyledCard>
          ))}
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            💡 Tip: A4 Horizontal is perfect for most certificates and works great with our border designs
          </Typography>
          
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
    </StyledContainer>
  );
};

export default SizeSelector;
