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
  Chip
} from '@mui/material';
import { 
  ArrowForward, 
  CheckCircle,
  CropSquare,
  CropPortrait
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
  maxWidth: 520,
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
    padding: theme.spacing(2),
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
      // If bulk mode is active, skip details form and go straight to border selection
      const bulkMode = sessionStorage.getItem('bulkMode') === 'true';
      navigate(bulkMode ? '/creation/border' : '/creation/form');
    }, 300);
  };

  return (
    <StyledContainer>
      <StyledPaper elevation={0}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#000000' }}>
              Choose Certificate Size
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 400, color: '#000000' }}>
            Select the perfect size for your certificate
          </Typography>
        </Box>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2.5,
          justifyContent: 'center',
          alignItems: 'center',
          mb: 3,
          maxWidth: 420,
          mx: 'auto',
        }}>
          {sizeOptions.map((option) => (
            <StyledCard
              key={option.id}
              selected={selectedSize === option.id}
              elevation={0}
            >
              <CardActionArea onClick={() => handleSelect(option.id)}>
                <CardContent sx={{ textAlign: 'center', p: 0 }}>
                  <Box sx={{ position: 'relative', mb: 1.5 }}>
                    {option.icon}
                    {selectedSize === option.id && (
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
                    {option.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.97rem' }}>
                    {option.dimensions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.95rem' }}>
                    {option.description}
                  </Typography>
                  {option.popular && (
                    <Chip
                      label="Most Popular"
                      size="small"
                      sx={{
                        backgroundColor: '#3a6ea5',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        borderRadius: 4,
                        px: 1.2,
                        py: 0.2,
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
            A4 Horizontal is perfect for most certificates and works great with our border designs
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
