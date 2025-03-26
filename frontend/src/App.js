import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Messaging from './pages/Messaging';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Routes>
      <Route path="/messages" element={<Messaging />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
  );
}

export default App;
