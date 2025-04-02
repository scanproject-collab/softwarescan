import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './pages/auth/LoginScreen';
import UpdateAdmin from './pages/admin/UpdateAdmin';
import ProfileAdmin from './pages/admin/ProfileAdmin';
import TagManagement from "./pages/admin/TagManagement";
import InstitutionManagement from "./pages/admin/InstitutionManagement"; // Importe o novo componente
import PasswordRecoveryRequestScreen from './pages/auth/PasswordRecoveryRequestScreen';
import PasswordRecoverySuccessScreen from './pages/auth/passwordRecoverySuccessScreen';
import PasswordResetCodeVerificationScreen from './pages/auth/passwordResetCodeVerificationScreen';
import PasswordResetScreen from './pages/auth/passwordResetScreen';
import UserProfileAdmin from './components/UserProfileAdmin';
import PolygonManagement from './pages/PolygonManagement.tsx';
import ProfileManager from './pages/manager/ProfileManager';
import 'leaflet/dist/leaflet';
import 'leaflet/dist/leaflet.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<App />} />
          <Route path="/tags" element={<TagManagement />} />
          <Route path="/institutions" element={<InstitutionManagement />} /> {/* Nova rota */}
          <Route path="/admin/profile" element={<ProfileAdmin />} />
          <Route path="/manager/profile" element={<ProfileManager />} />
          <Route path="/admin/update" element={<UpdateAdmin />} />
          <Route path="/polygons" element={<PolygonManagement />} />
          <Route path="/recovery" element={<PasswordRecoveryRequestScreen />} />
          <Route path="/recovery/success" element={<PasswordRecoverySuccessScreen />} />
          <Route path="/recovery/verify-code" element={<PasswordResetCodeVerificationScreen />} />
          <Route path="/recovery/reset" element={<PasswordResetScreen />} />
          <Route path="/user/:userId" element={<UserProfileAdmin />} />
        </Routes>
      </Router>
    </StrictMode>
);