import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/hooks/useToast';
import api from '../../../shared/services/api';
import { Notification } from '../types/notifications';

interface NotificationModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '90%',
    width: '500px',
    maxHeight: '90vh',
    borderRadius: '8px',
    padding: '24px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
  },
};

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onRequestClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Configuração do Modal para acessibilidade
  Modal.setAppElement('#root');

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  /**
   * Busca notificações do usuário
   */
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ items: Notification[]; unreadCount: number }>('/notifications');
      setNotifications(response.data.items);
      setUnreadCount(response.data.unreadCount);
    } catch (error: any) {
      toast.error('Erro ao carregar notificações');
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Marca uma notificação como lida
   */
  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);

      // Atualiza o estado local
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      // Atualiza o contador de não lidas
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Erro ao marcar notificação como lida');
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  /**
   * Marca todas as notificações como lidas
   */
  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');

      // Atualiza o estado local
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );

      // Zera o contador de não lidas
      setUnreadCount(0);

      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      toast.error('Erro ao marcar todas notificações como lidas');
      console.error('Erro ao marcar todas notificações como lidas:', error);
    }
  };

  /**
   * Formata data da notificação
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Notificações"
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h2 className="text-xl font-semibold">Notificações</h2>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                Marcar todas como lidas
              </Button>
            )}
            <button
              onClick={onRequestClose}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Fechar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
              <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path>
            </svg>
            <p>Você não tem notificações</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-grow -mx-6 px-6">
            <ul className="space-y-2">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-3 rounded-lg border ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className={`font-medium ${notification.read ? 'text-gray-800' : 'text-black'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">{formatDate(notification.createdAt)}</span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Marcar como lida
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}; 