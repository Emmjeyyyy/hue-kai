import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Generator } from './pages/Generator';
import { ImageExtractor } from './pages/ImageExtractor';
import { ColorWheel } from './pages/ColorWheel';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Generator />} />
        <Route path="/extract" element={<ImageExtractor />} />
        <Route path="/wheel" element={<ColorWheel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
