import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';

const SizeSelector = () => {
  const navigate = useNavigate();

  const handleSelect = (size) => {
    localStorage.setItem('certificateSize', size);
    navigate('/creation/form');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'center', bgcolor: '#f5f7fa' }}>
      <Paper elevation={3} sx={{ p: 4, minWidth: 340 }}>
        <Typography variant="h5" align="center" gutterBottom>Select Certificate Size</Typography>
        <Box sx={{ display: 'flex', gap: 3, mt: 4, justifyContent: 'center' }}>
          <Button variant="contained" size="large" onClick={() => handleSelect('A4-Horizontal')}>A4 Horizontal</Button>
          <Button variant="outlined" size="large" onClick={() => handleSelect('A4-Vertical')}>A4 Vertical</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SizeSelector;
