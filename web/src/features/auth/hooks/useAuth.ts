import { useState, useEffect, useCallback } from 'react';
import api from '../../../shared/services/api';
import { User, AuthState } from '../types/auth.types';

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthState>({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    isAuthenticated: !!localStorage.getItem('token')
  });

  const checkToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await api.get('/auth/verify-token', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }, []);

  const setAuthToken = useCallback(async (token: string | null, user: User | null = null): Promise<boolean> => {
    if (!token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuth({ token: null, user: null, isAuthenticated: false });
      return true;
    }

    const isValid = await checkToken(token);
    if (isValid) {
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      setAuth({ token, user, isAuthenticated: true });
      return true;
    }

    return false;
  }, [checkToken]);

  // Verificar token na inicialização
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const isValid = await checkToken(token);
        if (!isValid) {
          setAuthToken(null);
        }
      }
    };

    validateToken();
  }, [checkToken, setAuthToken]);

  return {
    token: auth.token,
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    setAuthToken
  };
}; 