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
      setStatus('Preparing preview...');

      // 1) Create CSV Blob and store ObjectURL + Base64 for later bulk generation
      const csv = toCsv(rows);
      const blob = new Blob([csv], { type: 'text/csv' });
      const csvUrl = window.URL.createObjectURL(blob);
      sessionStorage.setItem('bulkFileObjectUrl', csvUrl);
      sessionStorage.setItem('bulkFileName', 'bulk.csv');
      const base64 = btoa(unescape(encodeURIComponent(csv)));
      sessionStorage.setItem('bulkFileBase64', base64);

      // 2) Save first row as sample certificateData
      const sample = rows[0];
      localStorage.setItem('certificateData', JSON.stringify({
        name: sample['Recipient Name'] || '',
        course: sample['Course Name'] || '',
        date: sample['Certificate Date'] || '',
        issuer: sample['Issuing Organization'] || '',
        certificateTitle: sample['Certificate Title'] || '',
        paragraph: sample['Certificate Description'] || '',
      }));

      // 3) Indicate bulk mode and route to size selector first
      sessionStorage.setItem('bulkMode', 'true');
      navigate('/creation/size');
      setStatus('Select a border, then preview. When you save, all certificates will generate.');
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


