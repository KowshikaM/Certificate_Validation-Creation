import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '1.2rem'
        }}>
          Loading CertiGen...
        </div>
      }>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/creation/*" element={<CreationSection />} />
          <Route path="/detector" element={<DetectorSection />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
