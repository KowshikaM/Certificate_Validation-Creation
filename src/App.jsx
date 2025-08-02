import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const CreationSection = lazy(() => import('./components/Creation/CreationSection'));
const DetectorSection = lazy(() => import('./components/Detector/DetectorSection'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/creation/*" element={<CreationSection />} />
          <Route path="/detector" element={<DetectorSection />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
