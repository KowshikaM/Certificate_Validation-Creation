import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SizeSelector from './SizeSelector';
import CertificateForm from './CertificateForm';
import BorderPicker from './BorderPicker';
import CertificatePreview from './CertificatePreview';

const CreationSection = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="size" />} />
      <Route path="size" element={<SizeSelector />} />
      <Route path="form" element={<CertificateForm />} />
      <Route path="border" element={<BorderPicker />} />
      <Route path="preview" element={<CertificatePreview />} />
    </Routes>
  );
};

export default CreationSection;
