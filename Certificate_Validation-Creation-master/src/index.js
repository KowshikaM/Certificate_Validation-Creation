import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3a6ea5',
      light: '#e3ecfa',
      dark: '#2c5a8a',
    },
    secondary: {
      main: '#6c7b7f',
    },
    background: {
      default: '#f7fafd',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#5a6c7d',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(60, 80, 120, 0.08)',
    '0 6px 24px rgba(60, 80, 120, 0.12)',
    '0 12px 40px rgba(60, 80, 120, 0.16)',
    '0 20px 60px rgba(60, 80, 120, 0.20)',
    ...Array(20).fill('none'),
  ],
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
