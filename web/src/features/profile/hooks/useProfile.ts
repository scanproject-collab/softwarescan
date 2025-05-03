import { useState, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../shared/services/api';
import toast from 'react-hot-toast';
import { ProfileUpdateData } from '../types/profile.types';

export const useProfile = () => {
  const { user, token, setAuthToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const updateProfile = useCallback(async (data: ProfileUpdateData): Promise<boolean> => {
    if (!token || !user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      setLoading(true);

      // Caminho base de acordo com a função do usuário
      const basePath = user.role === 'ADMIN' ? '/admin' : '/manager';

      const response = await api.put(
        `${basePath}/update-profile`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Atualizar o token e informações do usuário
      const updatedUser = response.data.user;
      await setAuthToken(token, updatedUser);

      toast.success('Perfil atualizado com sucesso!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar perfil';
      toast.error(errorMessage);
      console.error('Erro ao atualizar perfil:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, user, setAuthToken]);

  return {
    user,
    loading,
    updateProfile
  };
}; 