import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const BulkUpload = lazy(() => import('./components/Dashboard/BulkUpload'));
const CreationSection = lazy(() => import('./components/Creation/CreationSection'));
const DetectorSection = lazy(() => import('./components/Detector/DetectorSection'));
const LoginPage = lazy(() => import('./components/Auth/LoginPage'));
const SignupPage = lazy(() => import('./components/Auth/SignupPage'));

function App() {
  return (
    <Router>
      <Suspense fallback={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'linear-gradient(135deg, #f7fafd 0%, #e3ecfa 100%)',
          color: '#3a6ea5',
          fontSize: '1.2rem',
          fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif',
          fontWeight: 500
        }}>
          <div style={{
            padding: '2rem',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(60, 80, 120, 0.12)',
            border: '1px solid rgba(209, 217, 230, 0.5)'
          }}>
            Loading CertiGen...
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/bulk" element={<BulkUpload />} />
          <Route path="/creation/*" element={<CreationSection />} />
          <Route path="/detector" element={<DetectorSection />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
