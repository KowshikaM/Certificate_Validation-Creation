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
      setStatusMessage('Generating certificates using fixed template...');

      // Define STRICT, pixel-perfect layout for the pre‑designed template
      const refWidth = 1120; // reference canvas width (px)
      const refHeight = 800; // reference canvas height (px)
      const fixedLayout = {
        referenceDimensions: { width: refWidth, height: refHeight },
        // Use absolute URL so backend can fetch the border reliably
        borderImageUrlAbsolute: `${window.location.origin}/borders/Border9.png`,
        elements: {
          title: {
            position: { x: 160, y: 90 },
            boxWidth: 800,
            style: { fontSize: 36, fontWeight: '700', color: '#1e2d8b', textAlign: 'center' },
          },
          intro: {
            position: { x: 260, y: 150 },
            boxWidth: 600,
            style: { fontSize: 18, fontWeight: '400', color: '#475569', textAlign: 'center' },
          },
          name: {
            position: { x: 280, y: 200 },
            boxWidth: 560,
            style: { fontSize: 28, fontWeight: '700', color: '#2d3748', textAlign: 'center' },
          },
          paragraph: {
            position: { x: 210, y: 250 },
            boxWidth: 700,
            style: { fontSize: 16, fontWeight: '400', color: '#475569', textAlign: 'center' },
          },
          course: {
            position: { x: 260, y: 308 },
            boxWidth: 600,
            style: { fontSize: 22, fontWeight: '700', color: '#1976d2', textAlign: 'center' },
          },
          date: {
            position: { x: 120, y: 640 },
            boxWidth: 220,
            style: { fontSize: 14, fontWeight: '400', color: '#6b7280', textAlign: 'left' },
          },
          issuer: {
            position: { x: 120, y: 670 },
            boxWidth: 260,
            style: { fontSize: 14, fontWeight: '400', color: '#6b7280', textAlign: 'left' },
          },
          qr: {
            position: { x: 880, y: 360 },
            size: 140,
          },
        },
      };

      const formData = new FormData();
      formData.append('file', file);
      formData.append('layout', JSON.stringify(fixedLayout));

      const res = await fetch(`${apiBaseUrl}/bulk_generate`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const maybeJson = await res.json().catch(() => null);
        throw new Error(maybeJson?.error || `Bulk generation failed with ${res.status}`);
      }
      const zipBlob = await res.blob();
      const url = URL.createObjectURL(zipBlob);
      setDownloadUrl(url);
      setStatusMessage('Done. Download your ZIP below.');
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


