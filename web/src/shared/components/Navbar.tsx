import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from './ui/Button';
import { NotificationModal } from '../../features/notifications/components/NotificationModal';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useNotifications } from '../../features/notifications/hooks/useNotifications';
import { Menu, X, LogOut, User, Settings, Home, Tag, Building, Users, Map } from 'lucide-react';

/**
 * Componente de barra de navegação principal
 */
const Navbar: React.FC = () => {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount, fetchNotifications } = useNotifications();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenNotifications = async () => {
    await fetchNotifications();
    setIsNotificationModalOpen(true);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link to="/" className="flex flex-shrink-0 items-center">
              <span className="text-xl font-bold text-blue-600">SoftwareScan</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center border-b-2 border-blue-500 px-1 pt-1 text-sm font-medium text-gray-900"
              >
                <Home className="mr-1 h-4 w-4" />
                Dashboard
              </Link>

              {user?.role === 'ADMIN' && (
                <>
                  <Link
                    to="/institutions"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    <Building className="mr-1 h-4 w-4" />
                    Instituições
                  </Link>
                  <Link
                    to="/managers"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    <Users className="mr-1 h-4 w-4" />
                    Gestores
                  </Link>
                </>
              )}

              {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                <>
                  <Link
                    to="/operators"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    <Users className="mr-1 h-4 w-4" />
                    Operadores
                  </Link>
                  <Link
                    to="/tags"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    <Tag className="mr-1 h-4 w-4" />
                    Tags
                  </Link>
                  <Link
                    to="/polygons"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    <Map className="mr-1 h-4 w-4" />
                    Polígonos
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative ml-3">
              <div className="flex items-center gap-4">
                <Link
                  to={user?.role === 'ADMIN' ? '/admin/profile' : '/manager/profile'}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Abrir menu</span>
              {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <Link
              to="/"
              className="block rounded-md bg-blue-50 px-3 py-2 text-base font-medium text-blue-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>

            {user?.role === 'ADMIN' && (
              <>
                <Link
                  to="/institutions"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Instituições
                </Link>
                <Link
                  to="/managers"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Gestores
                </Link>
              </>
            )}

            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
              <>
                <Link
                  to="/operators"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Operadores
                </Link>
                <Link
                  to="/tags"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tags
                </Link>
                <Link
                  to="/polygons"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Polígonos
                </Link>
              </>
            )}

            <div className="border-t border-gray-200 pt-4">
              <Link
                to={user?.role === 'ADMIN' ? '/admin/profile' : '/manager/profile'}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Perfil
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-red-600"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onRequestClose={() => setIsNotificationModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar; 