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
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  background: '#ffffff',
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
}));

const CertificateForm = () => {
  const [form, setForm] = useState({
    name: '',
    course: '',
    date: '',
    issuer: '',
    paragraph: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('certificateData', JSON.stringify(form));
    navigate('/creation/border');
  };

  return (
    <Box sx={{ bgcolor: '#f5f7fa', py: 8, minHeight: '100vh' }}>
      <Container maxWidth="md">
        <StyledPaper elevation={4}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
            🎓 Certificate Creation Form
          </Typography>
          <Typography align="center" sx={{ mb: 4, color: 'gray' }}>
            Please enter the details to generate a personalized certificate
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Recipient Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Course Name"
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Issuer Name"
                  name="issuer"
                  value={form.issuer}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Certificate Paragraph"
                  name="paragraph"
                  value={form.paragraph}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="e.g. This is to certify that [Name] has successfully completed the [Course]..."
                  required
                  variant="outlined"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 5, textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  px: 5,
                  py: 1.5,
                  fontWeight: 'bold',
                  borderRadius: 8,
                  background: 'linear-gradient(to right, #4A90E2, #007AFF)',
                }}
              >
                Next: Preview & Customize
              </Button>
            </Box>
          </Box>
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default CertificateForm;