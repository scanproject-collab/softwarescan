import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import Login from './pages/auth/loginScreen.tsx';

import TagManagement from "./pages/admin/TagManagement.tsx";
import 'leaflet/dist/leaflet.css';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />} />
        <Route path="/admin/tags" element={<TagManagement />}  />
      </Routes>
    </Router>
  </StrictMode>
);