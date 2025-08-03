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
  AutoAwesome,
  Favorite,
  Star
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
  maxWidth: 1200,
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
    padding: theme.spacing(2),
  },
}));

const borders = [
  { 
    name: 'Classic Elegance', 
    file: '/borders/Border1.png',
    category: 'premium',
    popular: true,
    description: 'Timeless design with sophisticated patterns'
  },
  { 
    name: 'Modern Minimal', 
    file: '/borders/Border2.jpg',
    category: 'modern',
    popular: false,
    description: 'Clean and contemporary style'
  },
  { 
    name: 'Floral Beauty', 
    file: '/borders/Border3.png',
    category: 'decorative',
    popular: true,
    description: 'Elegant floral motifs for special occasions'
  },
  { 
    name: 'Geometric Precision', 
    file: '/borders/Border4.png',
    category: 'modern',
    popular: false,
    description: 'Sharp lines and geometric patterns'
  },
  { 
    name: 'Vintage Charm', 
    file: '/borders/Border5.png',
    category: 'vintage',
    popular: false,
    description: 'Classic vintage style with ornate details'
  },
  { 
    name: 'Corporate Professional', 
    file: '/borders/Border6.png',
    category: 'business',
    popular: true,
    description: 'Professional design for business certificates'
  },
  { 
    name: 'Artistic Flair', 
    file: '/borders/Border7.png',
    category: 'creative',
    popular: false,
    description: 'Creative and artistic border design'
  },
  { 
    name: 'Luxury Premium', 
    file: '/borders/Border8.png',
    category: 'premium',
    popular: true,
    description: 'Premium luxury design for special achievements'
  },
];

const BorderPicker = () => {
  const navigate = useNavigate();
  const [selectedBorder, setSelectedBorder] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Designs', count: borders.length },
    { id: 'premium', name: 'Premium', count: borders.filter(b => b.category === 'premium').length },
    { id: 'modern', name: 'Modern', count: borders.filter(b => b.category === 'modern').length },
    { id: 'decorative', name: 'Decorative', count: borders.filter(b => b.category === 'decorative').length },
    { id: 'business', name: 'Business', count: borders.filter(b => b.category === 'business').length },
  ];

  const filteredBorders = selectedCategory === 'all' 
    ? borders 
    : borders.filter(border => border.category === selectedCategory);

  const handleSelect = (file) => {
    setSelectedBorder(file);
    // Add a small delay for better UX
    setTimeout(() => {
      localStorage.setItem('certificateBorder', file);
      navigate('/creation/preview');
    }, 300);
  };

  const getCategoryColor = (category) => {
    const colors = {
      premium: '#667eea',
      modern: '#4caf50',
      decorative: '#ff9800',
      vintage: '#9c27b0',
      business: '#2196f3',
      creative: '#f44336'
    };
    return colors[category] || '#667eea';
  };

  return (
    <StyledContainer>
      <StyledPaper elevation={0}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <AutoAwesome sx={{ fontSize: 40, color: '#667eea', mr: 1 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Choose Your Border Design
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 3 }}>
            Select from our collection of beautiful border designs
          </Typography>

          {/* Category Filter */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={`${category.name} (${category.count})`}
                onClick={() => setSelectedCategory(category.id)}
                sx={{
                  backgroundColor: selectedCategory === category.id ? '#667eea' : 'rgba(102, 126, 234, 0.1)',
                  color: selectedCategory === category.id ? 'white' : '#667eea',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: selectedCategory === category.id ? '#5a6fd8' : 'rgba(102, 126, 234, 0.2)',
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, 
          gap: 3,
          mb: 4
        }}>
          {filteredBorders.map((border) => (
            <StyledCard 
              key={border.file} 
              selected={selectedBorder === border.file}
              elevation={0}
            >
              <CardActionArea onClick={() => handleSelect(border.file)}>
                <CardContent sx={{ textAlign: 'center', p: 0 }}>
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <img 
                      src={border.file} 
                      alt={border.name} 
                      style={{ 
                        width: '100%', 
                        height: 120, 
                        objectFit: 'contain', 
                        borderRadius: 12,
                        border: '1px solid #e0e0e0'
                      }} 
                    />
                    {selectedBorder === border.file && (
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
                    {border.popular && (
                      <Star 
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          left: 8, 
                          color: '#ffd700',
                          fontSize: 20,
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                        }} 
                      />
                    )}
                  </Box>
                  
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2d3748' }}>
                    {border.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    {border.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Chip 
                      label={border.category.charAt(0).toUpperCase() + border.category.slice(1)} 
                      size="small" 
                      sx={{ 
                        backgroundColor: getCategoryColor(border.category), 
                        color: 'white',
                        fontWeight: 600
                      }} 
                    />
                    {border.popular && (
                      <Chip 
                        label="Popular" 
                        size="small" 
                        icon={<Favorite sx={{ fontSize: 14 }} />}
                        sx={{ 
                          backgroundColor: '#ff6b6b', 
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    )}
                  </Box>
                </CardContent>
              </CardActionArea>
            </StyledCard>
          ))}
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            💡 Tip: Premium borders are perfect for special achievements and formal certificates
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/creation/form')}
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
              Back to Form
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
        </Box>
      </StyledPaper>
    </StyledContainer>
  );
};

export default BorderPicker;
