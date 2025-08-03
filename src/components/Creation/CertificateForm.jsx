import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Container,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Alert,
  Chip
} from '@mui/material';
import { 
  Person, 
  School, 
  CalendarToday, 
  Business, 
  Description,
  ArrowForward,
  ArrowBack,
  AutoAwesome,
  CheckCircle
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

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
  padding: theme.spacing(4),
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

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
    },
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

const CertificateForm = () => {
  const [form, setForm] = useState({
    name: '',
    course: '',
    date: '',
    issuer: '',
    paragraph: '',
    certificateTitle: 'Certificate of Completion',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const steps = ['Size', 'Details', 'Border', 'Preview'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) newErrors.name = 'Recipient name is required';
    if (!form.course.trim()) newErrors.course = 'Course name is required';
    if (!form.date) newErrors.date = 'Date is required';
    if (!form.issuer.trim()) newErrors.issuer = 'Issuer name is required';
    if (!form.paragraph.trim()) newErrors.paragraph = 'Certificate paragraph is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      localStorage.setItem('certificateData', JSON.stringify(form));
      navigate('/creation/border');
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <StyledContainer>
      <Container maxWidth="md">
        <StyledPaper elevation={0}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <AutoAwesome sx={{ fontSize: 40, color: '#667eea', mr: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Certificate Details
              </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 3 }}>
              Fill in the details for your certificate
            </Typography>

            {/* Progress Stepper */}
            <Stepper activeStep={1} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Recipient Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Course Name"
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  error={!!errors.course}
                  helperText={errors.course}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <School sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Certificate Date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  error={!!errors.date}
                  helperText={errors.date}
                  InputLabelProps={{ shrink: true }}
                  required
                  variant="outlined"
                  inputProps={{ max: getCurrentDate() }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Issuing Organization"
                  name="issuer"
                  value={form.issuer}
                  onChange={handleChange}
                  error={!!errors.issuer}
                  helperText={errors.issuer}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Certificate Title"
                  name="certificateTitle"
                  value={form.certificateTitle}
                  onChange={handleChange}
                  variant="outlined"
                  placeholder="e.g., Certificate of Completion, Certificate of Achievement"
                />
              </Grid>

              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Certificate Description"
                  name="paragraph"
                  value={form.paragraph}
                  onChange={handleChange}
                  error={!!errors.paragraph}
                  helperText={errors.paragraph}
                  multiline
                  rows={4}
                  placeholder="e.g., This is to certify that [Name] has successfully completed the [Course] with outstanding performance..."
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <Description sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Tips Card */}
            <Card sx={{ mt: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #f8faff 0%, #e8f2ff 100%)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2d3748' }}>
                  💡 Tips for Great Certificates
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip label="Use full names" size="small" sx={{ backgroundColor: '#667eea', color: 'white' }} />
                  <Chip label="Include course details" size="small" sx={{ backgroundColor: '#667eea', color: 'white' }} />
                  <Chip label="Professional language" size="small" sx={{ backgroundColor: '#667eea', color: 'white' }} />
                  <Chip label="Clear descriptions" size="small" sx={{ backgroundColor: '#667eea', color: 'white' }} />
                </Box>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/creation/size')}
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
                Back to Size
              </Button>
              
              <StyledButton
                type="submit"
                variant="contained"
                endIcon={<ArrowForward />}
              >
                Next: Choose Border
              </StyledButton>
            </Box>
          </Box>
        </StyledPaper>
      </Container>
    </StyledContainer>
  );
};

export default CertificateForm;