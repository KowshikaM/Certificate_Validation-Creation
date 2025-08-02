import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'center', bgcolor: '#f5f7fa' }}>
      <Paper elevation={3} sx={{ p: 4, minWidth: 340 }}>
        <Typography variant="h5" align="center" gutterBottom>Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 3, mt: 4, justifyContent: 'center' }}>
          <Button variant="contained" size="large" onClick={() => navigate('/creation')}>Certificate Creation</Button>
          <Button variant="outlined" size="large" onClick={() => navigate('/detector')}>Certificate Detector</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
