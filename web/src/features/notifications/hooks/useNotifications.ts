import { useState, useCallback } from 'react';
import api from '../../../shared/services/api';
import { useToast } from '../../../shared/hooks/useToast';
import { Notification } from '../types/notifications';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * Hook para gerenciamento de notificações
 */
export const useNotifications = () => {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  /**
   * Busca notificações do usuário
   */
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<{ items: Notification[]; unreadCount: number }>('/notifications');

      setState({
        notifications: response.data.items,
        unreadCount: response.data.unreadCount,
      });

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar notificações';
      setError(errorMessage);
      console.error('Erro ao buscar notificações:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Marca uma notificação como lida
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);

      // Atualiza o estado local
      setState(prev => ({
        notifications: prev.notifications.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));

      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao marcar notificação como lida';
      toast.error(errorMessage);
      console.error('Erro ao marcar notificação como lida:', err);
      return false;
    }
  }, [toast]);

  /**
   * Marca todas as notificações como lidas
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');

      // Atualiza o estado local
      setState(prev => ({
        notifications: prev.notifications.map(notif => ({ ...notif, read: true })),
        unreadCount: 0,
      }));

      toast.success('Todas as notificações foram marcadas como lidas');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao marcar notificações como lidas';
      toast.error(errorMessage);
      console.error('Erro ao marcar todas notificações como lidas:', err);
      return false;
    }
  }, [toast]);

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}; 