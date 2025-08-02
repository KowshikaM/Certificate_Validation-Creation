import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';

const borders = [
  { name: 'Border 1', file: '/borders/Border1.png' },
  { name: 'Border 2', file: '/borders/Border2.jpg' },
  { name: 'Border 3', file: '/borders/Border3.png' },
  { name: 'Border 4', file: '/borders/Border4.png' },
  { name: 'Border 5', file: '/borders/Border5.png' },
  { name: 'Border 6', file: '/borders/Border6.png' },
  { name: 'Border 7', file: '/borders/Border7.png' },
  { name: 'Border 8', file: '/borders/Border8.png' },
];

const BorderPicker = () => {
  const navigate = useNavigate();

  const handleSelect = (file) => {
    localStorage.setItem('certificateBorder', file);
    navigate('/creation/preview');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      minHeight: '100vh', 
      justifyContent: 'center', 
      bgcolor: '#eef3f9', 
      px: 2 
    }}>
      <Paper 
        elevation={4} 
        sx={{ 
          p: 4, 
          maxWidth: 1000, 
          width: '100%', 
          borderRadius: 4, 
          backgroundColor: '#ffffff' 
        }}
      >
        <Typography 
          variant="h4" 
          align="center" 
          sx={{ mb: 4, fontWeight: 600, color: '#2b2f38' }}
        >
          Choose Your Certificate Border
        </Typography>

        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
            gap: 4, 
            justifyContent: 'center' 
          }}
        >
          {borders.map((border) => (
            <Paper 
              key={border.file} 
              elevation={2} 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                borderRadius: 3, 
                bgcolor: '#f9fafb',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              <img 
                src={border.file} 
                alt={border.name} 
                style={{ 
                  width: 200, 
                  height: 130, 
                  objectFit: 'contain', 
                  border: '2px solid #ddd', 
                  borderRadius: 10,
                  marginBottom: 12 
                }} 
              />
              <Button 
                variant="contained" 
                onClick={() => handleSelect(border.file)}
                sx={{
                  bgcolor: '#1e88e5',
                  '&:hover': {
                    bgcolor: '#1565c0'
                  },
                  borderRadius: 20,
                  px: 3
                }}
              >
                {border.name}
              </Button>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default BorderPicker;
