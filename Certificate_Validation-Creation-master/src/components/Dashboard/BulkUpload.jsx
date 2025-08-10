import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Container, Alert, Link, LinearProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const onFileChange = (e) => {
    setError('');
    setDownloadUrl('');
    const selected = e.target.files && e.target.files[0];
    if (!selected) return;
    const allowed = ['text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowed.includes(selected.type) && !selected.name.match(/\.(csv|xlsx)$/i)) {
      setError('Please upload a .csv or .xlsx file.');
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const onSubmit = async () => {
    setError('');
    setStatusMessage('');
    setDownloadUrl('');
    if (!file) {
      setError('Please select a .csv or .xlsx file first.');
      return;
    }
    try {
      setIsSubmitting(true);
      setStatusMessage('Uploading and generating certificates...');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${apiBaseUrl}/bulk_generate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const maybeJson = await response.clone().text();
        try {
          const parsed = JSON.parse(maybeJson);
          throw new Error(parsed?.error || 'Failed to generate certificates');
        } catch (_) {
          throw new Error(maybeJson || 'Failed to generate certificates');
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatusMessage('Certificates generated successfully. Click to download the ZIP.');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#f7fafd', py: 6 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(60, 80, 120, 0.12)' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Bulk Upload Certificates</Typography>
          <Typography variant="body1" sx={{ color: '#5a6c7d', mb: 3 }}>
            Upload an Excel (.xlsx) or CSV (.csv) file containing the required columns:
            <br />
            <strong>Recipient Name | Course Name | Certificate Date | Issuing Organization | Certificate Title | Certificate Description</strong>
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Choose File (.csv, .xlsx)
              <input
                type="file"
                hidden
                accept=".csv, .xlsx"
                onChange={onFileChange}
              />
            </Button>
            <Typography variant="body2" sx={{ color: '#3a6ea5' }}>
              {file ? file.name : 'No file selected'}
            </Typography>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={onSubmit}
              disabled={isSubmitting}
              startIcon={<CloudUploadIcon />}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              {isSubmitting ? 'Generating...' : 'Generate Certificates'}
            </Button>

            {isSubmitting && (
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <LinearProgress />
              </Box>
            )}
          </Box>

          {statusMessage && (
            <Typography variant="body2" sx={{ color: '#5a6c7d', mt: 2 }}>{statusMessage}</Typography>
          )}

          {downloadUrl && (
            <Box sx={{ mt: 3 }}>
              <Button
                component={Link}
                href={downloadUrl}
                download={`certificates_${Date.now()}.zip`}
                variant="contained"
                color="success"
                startIcon={<DownloadIcon />}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Download ZIP
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default BulkUpload;


