import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import Login from './pages/auth/LoginScreen.tsx';
import UpdateAdmin from './pages/admin/UpdateAdmin.tsx';
import ProfileAdmin from './pages/admin/ProfileAdmin.tsx';
import TagManagement from "./pages/admin/TagManagement.tsx";
import PasswordRecoveryRequestScreen from './pages/auth/PasswordRecoveryRequestScreen.tsx'; 
import PasswordRecoverySuccessScreen from './pages/auth/passwordRecoverySuccessScreen.tsx';
import PasswordResetCodeVerificationScreen from './pages/auth/passwordResetCodeVerificationScreen.tsx';
import PasswordResetScreen from './pages/auth/passwordResetScreen.tsx';
import UserProfile from './components/UserProfile.tsx';
import PolygonManagement from './pages/admin/PolygonManagement.tsx';
import 'leaflet/dist/leaflet';
import 'leaflet/dist/leaflet.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />} />
        <Route path="/admin/tags" element={<TagManagement />} />
        <Route path="/admin/profile" element={<ProfileAdmin />} />
        <Route path="/admin/update" element={<UpdateAdmin />} />
        <Route path="/admin/polygons" element={<PolygonManagement  />} /> {/* Nova rota */}
        <Route path="/recovery" element={<PasswordRecoveryRequestScreen />} />
        <Route path="/recovery/success" element={<PasswordRecoverySuccessScreen />} />
        <Route path="/recovery/verify-code" element={<PasswordResetCodeVerificationScreen />} />
        <Route path="/recovery/reset" element={<PasswordResetScreen />} />
        <Route path="/user/:userId" element={<UserProfile />} />
      </Routes>
    </Router>
  </StrictMode>
);