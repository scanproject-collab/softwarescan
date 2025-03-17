import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import Login from './pages/auth/loginScreen.tsx';
import UpdateAdmin from './pages/admin/UpdateAdmin.tsx';
import ProfileAdmin from './pages/admin/ProfileAdmin.tsx';

import TagManagement from "./pages/admin/TagManagement.tsx";
import 'leaflet/dist/leaflet.css';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />} />
        <Route path="/admin/tags" element={<TagManagement />}  />
        <Route path="/admin/profile" element={<ProfileAdmin />} />
        <Route path="/admin/update" element={<UpdateAdmin />} />
      </Routes>
    </Router>
  </StrictMode>
);