// ✅ [1] REPLACE the entire content of Dashboard.jsx with this

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Button, Card, CardContent,
  CardActionArea, Container, AppBar, Toolbar, IconButton,
  Menu, MenuItem, Divider
} from '@mui/material';
import {
  Add, Search, Notifications, AccountCircle, School,
  Create, QrCodeScanner, History, Settings
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// ✅ Styling
const StyledContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: '#f7fafd',
  position: 'relative',
  overflow: 'hidden',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 14,
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  transition: '0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 500,
  padding: theme.spacing(1.2, 2.5),
}));

// ✅ Component
const Dashboard = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    navigate('/login');
  };

  const actions = [
    {
      title: 'Create Certificate',
      description: 'Design a new certificate from scratch.',
      icon: <Create color="primary" sx={{ fontSize: 40 }} />,
      onClick: () => navigate('/creation/size'),
    },
    {
      title: 'Bulk Upload Certificates',
      description: 'Generate many certificates from CSV/XLSX.',
      icon: <Add sx={{ fontSize: 40, color: '#3f51b5' }} />,
      onClick: () => navigate('/dashboard/bulk'),
    },
    {
      title: 'Native Bulk Form',
      description: 'Add rows and generate without leaving the site.',
      icon: <Add sx={{ fontSize: 40, color: '#2e7d32' }} />,
      onClick: () => navigate('/dashboard/bulk/native'),
    },
    {
      title: 'Verify Certificate',
      description: 'Scan a QR to verify authenticity.',
      icon: <QrCodeScanner color="success" sx={{ fontSize: 40 }} />,
      onClick: () => navigate('/detector'),
    },
    {
      title: 'View History',
      description: 'Track your created certificates.',
      icon: <History sx={{ fontSize: 40, color: '#ff9800' }} />,
      onClick: () => {}, // Add history page navigation
    },
    {
      title: 'Account Settings',
      description: 'Manage your preferences and account.',
      icon: <Settings sx={{ fontSize: 40, color: '#9c27b0' }} />,
      onClick: () => {}, // Add settings navigation
    },
  ];

  return (
    <StyledContainer>
      <AppBar position="static" sx={{ background: '#ffffff', color: '#000', boxShadow: 'none', borderBottom: '1px solid #ddd' }}>
        <Toolbar>
          <School sx={{ mr: 1, color: '#3f51b5' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            CertiGen
          </Typography>
          <IconButton onClick={handleMenuOpen}>
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, color: '#000000' }}>
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          {actions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StyledCard>
                <CardActionArea onClick={action.onClick} sx={{ p: 3, textAlign: 'center' }}>
                  {action.icon}
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#000000' }}>
                    {action.description}
                  </Typography>
                </CardActionArea>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        {/* Placeholder for dynamic activity/logs */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Recent Activity
          </Typography>

          <StyledCard>
            <CardContent sx={{ py: 5, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                You haven’t created or verified any certificates yet.
              </Typography>
              <StyledButton
                variant="contained"
                startIcon={<Add />}
                sx={{ mt: 3 }}
                onClick={() => navigate('/creation/size')}
              >
                Create Certificate
              </StyledButton>
            </CardContent>
          </StyledCard>
        </Box>
      </Container>
    </StyledContainer>
  );
};

export default Dashboard;