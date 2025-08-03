import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActionArea,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Divider
} from '@mui/material';
import { 
  Add, 
  Search, 
  Notifications, 
  AccountCircle,
  School,
  AutoAwesome,
  TrendingUp,
  History,
  Settings,
  Logout,
  Dashboard as DashboardIcon,
  Create,
  QrCodeScanner
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
  fontSize: '1.1rem',
  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
  color: 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
  },
}));

const Dashboard = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    navigate('/login');
  };

  const quickActions = [
    {
      title: 'Create Certificate',
      description: 'Design a new certificate with our easy-to-use tools',
      icon: <Create sx={{ fontSize: 40, color: '#667eea' }} />,
      action: () => navigate('/creation/size'),
      color: '#667eea',
      popular: true
    },
    {
      title: 'Verify Certificate',
      description: 'Scan QR codes to verify certificate authenticity',
      icon: <QrCodeScanner sx={{ fontSize: 40, color: '#4caf50' }} />,
      action: () => navigate('/detector'),
      color: '#4caf50'
    },
    {
      title: 'Certificate History',
      description: 'View and manage your previously created certificates',
      icon: <History sx={{ fontSize: 40, color: '#ff9800' }} />,
      action: () => console.log('History'),
      color: '#ff9800'
    },
    {
      title: 'Settings',
      description: 'Customize your account and certificate preferences',
      icon: <Settings sx={{ fontSize: 40, color: '#9c27b0' }} />,
      action: () => console.log('Settings'),
      color: '#9c27b0'
    }
  ];

  const stats = [
    { label: 'Certificates Created', value: '24', trend: '+12%', color: '#667eea' },
    { label: 'This Month', value: '8', trend: '+25%', color: '#4caf50' },
    { label: 'Total Downloads', value: '156', trend: '+8%', color: '#ff9800' },
    { label: 'Verifications', value: '89', trend: '+15%', color: '#9c27b0' }
  ];

  return (
    <StyledContainer>
      {/* App Bar */}
      <AppBar position="static" sx={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', boxShadow: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <School sx={{ fontSize: 32, color: '#667eea', mr: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              CertiGen
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton sx={{ color: '#667eea' }}>
              <Search />
            </IconButton>
            <IconButton sx={{ color: '#667eea' }}>
              <Notifications />
            </IconButton>
            <IconButton onClick={handleMenuOpen} sx={{ color: '#667eea' }}>
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            mt: 1,
            minWidth: 200
          }
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <AccountCircle sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Settings sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#2d3748' }}>
            Welcome back! 👋
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            Ready to create something amazing? Let's design your next certificate.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Box>
                    <TrendingUp sx={{ color: stat.color, fontSize: 32 }} />
                  </Box>
                  <Chip 
                    label={stat.trend} 
                    size="small" 
                    sx={{ 
                      mt: 1, 
                      backgroundColor: stat.color, 
                      color: 'white',
                      fontWeight: 600
                    }} 
                  />
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, color: '#2d3748' }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StyledCard>
                  <CardActionArea onClick={action.action} sx={{ p: 3 }}>
                    <CardContent sx={{ textAlign: 'center', p: 0 }}>
                      <Box sx={{ mb: 2 }}>
                        {action.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2d3748' }}>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {action.description}
                      </Typography>
                      {action.popular && (
                        <Chip 
                          label="Most Popular" 
                          size="small" 
                          sx={{ 
                            backgroundColor: action.color, 
                            color: 'white',
                            fontWeight: 600
                          }} 
                        />
                      )}
                    </CardContent>
                  </CardActionArea>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Recent Activity */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, color: '#2d3748' }}>
            Recent Activity
          </Typography>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Certificates
                </Typography>
                <StyledButton
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/creation/size')}
                >
                  Create New
                </StyledButton>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <AutoAwesome sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No certificates yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Start by creating your first certificate
                  </Typography>
                  <StyledButton
                    variant="contained"
                    startIcon={<Create />}
                    onClick={() => navigate('/creation/size')}
                  >
                    Create Your First Certificate
                  </StyledButton>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Box>
      </Container>
    </StyledContainer>
  );
};

export default Dashboard;
