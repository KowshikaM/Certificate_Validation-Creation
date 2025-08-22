import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  Alert,
  LinearProgress,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';

const REQUIRED_COLUMNS = [
  'Recipient Name',
  'Course Name',
  'Certificate Date',
  'Issuing Organization',
  'Certificate Title',
  'Certificate Description',
];

const emptyRow = () => ({
  'Recipient Name': '',
  'Course Name': '',
  'Certificate Date': '',
  'Issuing Organization': '',
  'Certificate Title': '',
  'Certificate Description': '',
});

const toCsv = (rows) => {
  const escape = (val) => {
    const s = String(val ?? '');
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const header = REQUIRED_COLUMNS.join(',');
  const body = rows.map((r) => REQUIRED_COLUMNS.map((c) => escape(r[c])).join(',')).join('\n');
  return header + '\n' + body + '\n';
};

const fieldHelper = {
  'Recipient Name': 'Full name as it should appear on the certificate',
  'Course Name': 'Exact course/program name',
  'Certificate Date': 'YYYY-MM-DD (or your date format)',
  'Issuing Organization': 'Your organization/school name',
  'Certificate Title': 'e.g., Certificate of Completion',
  'Certificate Description': 'Short description that appears on the PDF',
};

const NativeBulkForm = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([emptyRow()]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  const missingInfo = useMemo(() => {
    const issues = [];
    rows.forEach((row, idx) => {
      REQUIRED_COLUMNS.forEach((c) => {
        if (!String(row[c] || '').trim()) {
          issues.push(`Row ${idx + 1}: ${c}`);
        }
      });
    });
    return issues;
  }, [rows]);

  const updateCell = (index, field) => (e) => {
    const value = e.target.value;
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (index) => setRows((prev) => prev.filter((_, i) => i !== index));

  const submit = async () => {
    setError('');
    setStatus('');
    setDownloadUrl('');

    if (!rows.length) {
      setError('Please add at least one row.');
      return;
    }
    if (missingInfo.length) {
      setError(`Missing required fields: ${missingInfo.slice(0, 5).join('; ')}${missingInfo.length > 5 ? ' …' : ''}`);
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus('Generating certificates using fixed template...');

      // Create CSV Blob
      const csv = toCsv(rows);
      const blob = new Blob([csv], { type: 'text/csv' });

      // Prefer the user's saved layout from the designer to guarantee pixel-perfect reuse
      let layoutToUse = null;
      try {
        const savedStateRaw = localStorage.getItem('certificateState');
        if (savedStateRaw) {
          const saved = JSON.parse(savedStateRaw);
          const { elements = {}, certificateSize = 'A4-Horizontal', borderImage = '' } = saved || {};

          // Build compact elements matching the backend contract
          const compactElements = {};
          Object.entries(elements).forEach(([key, el]) => {
            compactElements[key] = {
              position: el.position,
              style: el.style,
            };
            const defaultBoxWidths = { title: 400, intro: 300, name: 200, paragraph: 400, course: 300, date: 200, issuer: 240 };
            if (key !== 'qr') compactElements[key].boxWidth = defaultBoxWidths[key] || 300;
            if (key === 'qr' && el.size) compactElements[key].size = el.size;
          });

          // Reference dimensions exactly as the preview uses
          const dimsMap = {
            'A4-Horizontal': { width: 800, height: 600 },
            'A4-Vertical': { width: 600, height: 800 },
            'A3-Horizontal': { width: 1000, height: 700 },
            'A3-Vertical': { width: 700, height: 1000 },
          };
          const refDims = dimsMap[certificateSize] || dimsMap['A4-Horizontal'];

          // Absolute border URL for backend to fetch
          const borderAbsolute = /^https?:/i.test(borderImage)
            ? borderImage
            : `${window.location.origin}${borderImage ? (borderImage.startsWith('/') ? '' : '/') : ''}${borderImage || 'borders/Border9.png'}`;

          layoutToUse = {
            elements: compactElements,
            borderImageUrl: borderImage,
            borderImageUrlAbsolute: borderAbsolute,
            referenceDimensions: refDims,
          };
        }
      } catch (_) {
        // ignore and fallback below
      }

      // Fallback strict layout if nothing saved
      if (!layoutToUse) {
        const refWidth = 1120;
        const refHeight = 800;
        layoutToUse = {
          referenceDimensions: { width: refWidth, height: refHeight },
          borderImageUrlAbsolute: `${window.location.origin}/borders/Border9.png`,
          elements: {
            title: { position: { x: 160, y: 90 }, boxWidth: 800, style: { fontSize: 36, fontWeight: '700', color: '#1e2d8b', textAlign: 'center' } },
            intro: { position: { x: 260, y: 150 }, boxWidth: 600, style: { fontSize: 18, fontWeight: '400', color: '#475569', textAlign: 'center' } },
            name: { position: { x: 280, y: 200 }, boxWidth: 560, style: { fontSize: 28, fontWeight: '700', color: '#2d3748', textAlign: 'center' } },
            paragraph: { position: { x: 210, y: 250 }, boxWidth: 700, style: { fontSize: 16, fontWeight: '400', color: '#475569', textAlign: 'center' } },
            course: { position: { x: 260, y: 308 }, boxWidth: 600, style: { fontSize: 22, fontWeight: '700', color: '#1976d2', textAlign: 'center' } },
            date: { position: { x: 120, y: 640 }, boxWidth: 220, style: { fontSize: 14, fontWeight: '400', color: '#6b7280', textAlign: 'left' } },
            issuer: { position: { x: 120, y: 670 }, boxWidth: 260, style: { fontSize: 14, fontWeight: '400', color: '#6b7280', textAlign: 'left' } },
            qr: { position: { x: 880, y: 360 }, size: 140 },
          },
        };
      }

      const formData = new FormData();
      formData.append('file', blob, 'bulk.csv');
      formData.append('layout', JSON.stringify(layoutToUse));

      const res = await fetch(`${apiBaseUrl}/bulk_generate`, { method: 'POST', body: formData });
      if (!res.ok) {
        const maybeJson = await res.json().catch(() => null);
        throw new Error(maybeJson?.error || `Bulk generation failed with ${res.status}`);
      }
      const zipBlob = await res.blob();
      const url = URL.createObjectURL(zipBlob);
      setDownloadUrl(url);
      setStatus('Done. Download your ZIP below.');
    } catch (e) {
      setError(e.message || 'Unexpected error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#f7fafd', py: 6 }}>
      <Paper sx={{ p: 3, maxWidth: 1100, mx: 'auto', borderRadius: 3, boxShadow: '0 8px 32px rgba(60,80,120,0.12)' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Native Bulk Form</Typography>
        <Typography variant="body1" sx={{ color: '#5a6c7d', mb: 2 }}>
          Add multiple recipients, then generate all certificates at once. All required fields must be filled.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {status && <Alert severity="info" sx={{ mb: 2 }}>{status}</Alert>}

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addRow} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Add Row
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={submit}
            disabled={isSubmitting}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            {isSubmitting ? 'Generating…' : 'Generate Certificates'}
          </Button>
          {isSubmitting && <Box sx={{ flex: 1, minWidth: 200 }}><LinearProgress /></Box>}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          {rows.map((row, idx) => (
            <Paper key={idx} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e6ef' }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Recipient Name"
                  value={row['Recipient Name']}
                  onChange={updateCell(idx, 'Recipient Name')}
                  fullWidth
                  helperText={fieldHelper['Recipient Name']}
                />
                <TextField
                  label="Course Name"
                  value={row['Course Name']}
                  onChange={updateCell(idx, 'Course Name')}
                  fullWidth
                  helperText={fieldHelper['Course Name']}
                />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <TextField
                  label="Certificate Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={row['Certificate Date']}
                  onChange={updateCell(idx, 'Certificate Date')}
                  fullWidth
                  helperText={fieldHelper['Certificate Date']}
                />
                <TextField
                  label="Issuing Organization"
                  value={row['Issuing Organization']}
                  onChange={updateCell(idx, 'Issuing Organization')}
                  fullWidth
                  helperText={fieldHelper['Issuing Organization']}
                />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <TextField
                  label="Certificate Title"
                  value={row['Certificate Title']}
                  onChange={updateCell(idx, 'Certificate Title')}
                  fullWidth
                  helperText={fieldHelper['Certificate Title']}
                />
                <TextField
                  label="Certificate Description"
                  value={row['Certificate Description']}
                  onChange={updateCell(idx, 'Certificate Description')}
                  fullWidth
                  multiline
                  minRows={2}
                  helperText={fieldHelper['Certificate Description']}
                />
              </Stack>
              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
                <IconButton aria-label="remove" onClick={() => removeRow(idx)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>

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
      </Paper>
    </Box>
  );
};

export default NativeBulkForm;


