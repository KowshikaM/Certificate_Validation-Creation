import React, { useState } from 'react';

const DetectorSection = () => {
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.png')) {
      setError('Invalid file type. Please upload a PNG.');
      setFile(null);
      return;
    }
    setError('');
    setFile(f);
  };

  const onVerify = async () => {
    if (!file) { setError('Please select a PNG file.'); return; }
    if (!username.trim()) { setError('Please enter a username.'); return; }
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('username', username.trim());
      const apiBase = process.env.REACT_APP_BACKEND_URL || (typeof window !== 'undefined' && window.location && window.location.port === '3000' ? 'http://localhost:5000' : '');
      const res = await fetch(`${apiBase}/verify`, {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (data.status === 'error') {
        if (data.reason === 'no_embedded_hash') {
          setError('No embedded hash found in the image.');
        } else if (data.reason === 'invalid_file_type') {
          setError('Invalid file type. Please upload a PNG.');
        } else {
          setError('Verification error.');
        }
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (e) {
      setError('Network or server error.');
    } finally {
      setLoading(false);
    }
  };

  const onGenerate = async () => {
    if (!username.trim()) { setError('Please enter a username first.'); return; }
    setLoading(true);
    setError('');
    try {
      const apiBase = process.env.REACT_APP_BACKEND_URL || (typeof window !== 'undefined' && window.location && window.location.port === '3000' ? 'http://localhost:5000' : '');
      const payload = {
        data: {
          'Recipient Name': username,
          'Course Name': 'CYBERSECURITY',
          'Certificate Date': new Date().toISOString().slice(0,10),
          'Issuing Organization': 'IBM',
          'Certificate Title': 'Certificate of Completion',
          'Certificate Description': ''
        }
      };
      const res = await fetch(`${apiBase}/generate_png`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) { throw new Error('Failed to generate PNG'); }
      const blob = await res.blob();
      const fileName = `certificate_${Date.now()}.png`;

      // Trigger download for the user
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);

      // Preload into file input for immediate verification
      const generatedFile = new File([blob], fileName, { type: 'image/png' });
      setFile(generatedFile);
    } catch (e) {
      setError('Could not generate a PNG. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f7fafd',
      padding: '2rem',
      fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(60, 80, 120, 0.12)',
        border: '1px solid rgba(209, 217, 230, 0.5)',
        maxWidth: '560px',
        width: '100%'
      }}>
        <h2 style={{ 
          color: '#3a6ea5', 
          marginBottom: '0.5rem',
          fontSize: '1.8rem',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          Verify Certificate
        </h2>
        <p style={{ color: '#5a6c7d', textAlign: 'center', marginBottom: '1.5rem' }}>
          Upload a PNG certificate and enter the username to verify.
        </p>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#3a6ea5', marginBottom: '0.5rem' }}>PNG File</label>
            <input type="file" accept="image/png" onChange={onFileChange} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#3a6ea5', marginBottom: '0.5rem' }}>Username</label>
            <input
              type="text"
              placeholder="e.g. alice"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cdd7e3' }}
            />
          </div>
          <button onClick={onVerify} disabled={loading} style={{
            background: loading ? '#94b3e6' : '#3a6ea5',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.2rem',
            borderRadius: '10px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600
          }}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>

          <button onClick={onGenerate} disabled={loading} style={{
            background: loading ? '#c8e6c9' : '#2e7d32',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1rem',
            borderRadius: '10px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600
          }}>
            {loading ? 'Generating...' : 'Generate Test PNG'}
          </button>

          {error && (
            <div style={{ background: '#fde8e8', border: '1px solid #f5bdbd', color: '#a33a3a', padding: '0.75rem', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          {result && (
            <div style={{
              padding: '1rem',
              borderRadius: '12px',
              border: `2px solid ${result.valid ? '#34a853' : '#ea4335'}`,
              background: result.valid ? '#e7f6eb' : '#fdecea'
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: result.valid ? '#1e7d3b' : '#a83a30', marginBottom: '0.5rem' }}>
                {result.valid ? '✅ Valid' : '❌ Invalid'} (method: {result.method})
              </div>
              <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                <div><strong>Extracted:</strong> {result.extracted_hash}</div>
                <div><strong>Expected:</strong> {result.expected_hash}</div>
                {result.normalized_username && (
                  <div><strong>Normalized Name:</strong> {result.normalized_username}</div>
                )}
                {result.reason === 'name_mismatch' && (
                  <div style={{ color: '#a83a30', marginTop: '0.5rem' }}>
                    The entered name does not match the hash embedded in the image.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetectorSection;
