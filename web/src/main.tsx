import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import 'leaflet/dist/leaflet';
import 'leaflet/dist/leaflet.css';

// Pages
import LoginPage from './pages/auth/LoginPage';
import PasswordRecoveryPage from './pages/auth/PasswordRecoveryPage';
import PasswordRecoverySuccessPage from './pages/auth/PasswordRecoverySuccessPage';
import PasswordResetCodeVerificationPage from './pages/auth/PasswordResetCodeVerificationPage';
import PasswordResetPage from './pages/auth/PasswordResetPage';
import ProfileAdminPage from './pages/admin/ProfileAdmin';
import UpdateAdminPage from './pages/admin/UpdateAdmin';
import TagManagementPage from './pages/admin/TagManagementPage';
import InstitutionManagementPage from './pages/admin/InstitutionManagementPage';
import ManagerManagementPage from './pages/admin/ManagerManagementPage';
import ProfileManagerPage from './pages/manager/ProfileManager';
import PolygonManagementPage from './pages/PolygonManagementPage';
import OperatorManagementPage from './pages/OperatorManagementPage';
import NotFoundPage from './pages/NotFoundPage';
import UserProfilePage from './pages/UserProfilePage';

// Features
import { ProtectedRoute } from './shared/components/ProtectedRoute';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recovery" element={<PasswordRecoveryPage />} />
        <Route path="/recovery/success" element={<PasswordRecoverySuccessPage />} />
        <Route path="/verify-code" element={<PasswordResetCodeVerificationPage />} />
        <Route path="/reset-password/:code" element={<PasswordResetPage />} />

        {/* Home - Dashboard */}
        <Route path="/" element={<App />} />

        {/* Rotas de Admin */}
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <ProfileAdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/update"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <UpdateAdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tags"
          element={
            <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
              <TagManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institutions"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <InstitutionManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/managers"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <ManagerManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operators"
          element={
            <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
              <OperatorManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/polygons"
          element={
            <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
              <PolygonManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Rotas de Manager */}
        <Route
          path="/managers/profile"
          element={
            <ProtectedRoute roles={['MANAGER']}>
              <ProfileManagerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/managers/update"
          element={
            <ProtectedRoute roles={['MANAGER']}>
              <UpdateAdminPage />
            </ProtectedRoute>
          }
        />

        {/* User Profile route */}
        <Route
          path="/user/:userId"
          element={
            <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Rota 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);