import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Container, Alert, LinearProgress, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';

const BulkUpload = () => {
  const navigate = useNavigate();
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
      setStatusMessage('Preparing preview...');
      const formData = new FormData();
      formData.append('file', file);

      // 1) Ask backend for a sample row to preview
      const sampleRes = await fetch(`${apiBaseUrl}/bulk_preview_sample`, {
        method: 'POST',
        body: formData,
      });
      const sampleJson = await sampleRes.json();
      if (!sampleRes.ok) throw new Error(sampleJson.error || 'Failed to read file');

      // 2) Persist the original file for later bulk generation (ObjectURL + Base64)
      const fileUrl = URL.createObjectURL(file);
      sessionStorage.setItem('bulkFileObjectUrl', fileUrl);
      sessionStorage.setItem('bulkFileName', file.name || 'bulk.xlsx');
      // Also store base64 in case ObjectURL is invalidated during navigation
      const fileAsBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      sessionStorage.setItem('bulkFileBase64', fileAsBase64);

      // 3) Save sample to localStorage for preview component
      const sample = sampleJson.sample || {};
      localStorage.setItem('certificateData', JSON.stringify({
        name: sample['Recipient Name'] || '',
        course: sample['Course Name'] || '',
        date: sample['Certificate Date'] || '',
        issuer: sample['Issuing Organization'] || '',
        certificateTitle: sample['Certificate Title'] || '',
        paragraph: sample['Certificate Description'] || '',
      }));

      // 4) Indicate bulk mode and route to size selector → border → preview
      sessionStorage.setItem('bulkMode', 'true');
      navigate('/creation/size');
      setStatusMessage('Select a border, then preview. When you save, all certificates will generate.');
    } catch (err) {
      const msg = err?.message || 'An unexpected error occurred';
      const hint = `Could not reach API at ${apiBaseUrl}. Ensure backend is running (try opening ${apiBaseUrl}/health) and that CORS/HTTPS are correct.`;
      setError(`${msg}. ${hint}`);
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
            Upload a CSV or Excel file to generate multiple certificates at once with the same design and border.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Upload CSV/XLSX File</Typography>
          <Typography variant="body2" sx={{ color: '#5a6c7d', mb: 2 }}>
            Upload an Excel (.xlsx) or CSV (.csv) file containing the required columns:
            <br />
            <strong>Recipient Name | Course Name | Certificate Date | Issuing Organization | Certificate Title | Certificate Description</strong>
          </Typography>

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
            <Typography variant="body2" sx={{ color: '#5a6ea5', mt: 2 }}>{statusMessage}</Typography>
          )}

          {downloadUrl && (
            <Box sx={{ mt: 3 }}>
              <Button
                component="a"
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

          <Box sx={{ mt: 4, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2d3748' }}>
              How it works:
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ color: '#4a5568' }}>
                1. Upload your CSV/XLSX file with recipient details
              </Typography>
              <Typography variant="body2" sx={{ color: '#4a5568' }}>
                2. Choose certificate size and border design
              </Typography>
              <Typography variant="body2" sx={{ color: '#4a5568' }}>
                3. Customize text positioning and styling
              </Typography>
              <Typography variant="body2" sx={{ color: '#4a5568' }}>
                4. Click "Save & Download" to generate all certificates
              </Typography>
              <Typography variant="body2" sx={{ color: '#4a5568' }}>
                5. Download as ZIP file containing all certificates with SHA-256 security
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default BulkUpload;


