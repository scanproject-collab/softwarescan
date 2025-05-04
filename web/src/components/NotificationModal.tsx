import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog.tsx';
import api from '../shared/services/api';
import { Bell, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.ts';

interface UserInfo {
    name?: string;
    institution?: string;
}

interface Notification {
    id: string;
    type: string;
    message: string;
    createdAt: string;
    read: boolean;
    userInfo?: UserInfo | null;
}

const NotificationModal: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [deletedNotifications, setDeletedNotifications] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Função para buscar notificações
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);

            // Endpoint correto com base no papel do usuário
            const endpoint = user?.role === 'MANAGER' ? '/managers/notifications' : '/admin/notifications';

            const response = await api.get(endpoint);
            let fetchedNotifications: Notification[] = response.data.notifications.map((notif: any) => ({
                id: notif.id,
                type: notif.type,
                message: notif.message,
                createdAt: notif.createdAt,
                read: false, // Será atualizado com localStorage
                userInfo: notif.userInfo,
            }));

            // Carrega as notificações lidas e deletadas do localStorage
            const storageKey = `notifications_${user?.id || 'unknown'}`;
            const storageDeletedKey = `deletedNotifications_${user?.id || 'unknown'}`;

            const savedReadNotifications = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const savedDeletedNotifications = JSON.parse(localStorage.getItem(storageDeletedKey) || '[]');

            // Filtra notificações deletadas e marca as lidas
            fetchedNotifications = fetchedNotifications
                .map(n => ({
                    ...n,
                    read: savedReadNotifications.includes(n.id),
                }))
                .filter(n => !savedDeletedNotifications.includes(n.id));

            setNotifications(fetchedNotifications);
            setDeletedNotifications(savedDeletedNotifications);
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
            setError('Não foi possível carregar as notificações');
        } finally {
            setLoading(false);
        }
    };

    // Efeito para buscar notificações e manter estado atualizado
    useEffect(() => {
        if (user?.id) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user?.id]);

    // Função para abrir e marcar todas como lidas no frontend
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            onOpen(); // Reseta a contagem na Navbar
            const readIds = notifications.map(n => n.id);
            const storageKey = `notifications_${user?.id || 'unknown'}`;
            localStorage.setItem(storageKey, JSON.stringify(readIds));
            setNotifications(prev =>
                prev.map(notification => ({ ...notification, read: true }))
            );
        }
    };

    // Apagar todas as notificações (apenas no frontend e localStorage)
    const handleDeleteAllNotifications = () => {
        const allIds = notifications.map(n => n.id);
        setDeletedNotifications(allIds);
        setNotifications([]);
        const storageDeletedKey = `deletedNotifications_${user?.id || 'unknown'}`;
        localStorage.setItem(storageDeletedKey, JSON.stringify(allIds));
    };

    // Apagar uma notificação específica
    const handleDeleteNotification = (id: string) => {
        const updatedDeletedNotifications = [...deletedNotifications, id];
        setDeletedNotifications(updatedDeletedNotifications);
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        const storageDeletedKey = `deletedNotifications_${user?.id || 'unknown'}`;
        localStorage.setItem(storageDeletedKey, JSON.stringify(updatedDeletedNotifications));
    };

    // Definir cores das notificações por tipo
    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'pending': return 'bg-yellow-100';
            case 'approved': return 'bg-green-100';
            case 'rejected': return 'bg-red-100';
            case 'deleted': return 'bg-red-50';
            case 'expired': return 'bg-gray-100';
            default: return 'bg-blue-50';
        }
    };

    // Formatar data para exibição
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button className="relative focus:outline-none">
                    <Bell className="h-6 w-6 text-white" />
                    {notifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                            {notifications.filter(n => !n.read).length}
                        </span>
                    )}
                </button>
            </DialogTrigger>
            <DialogContent className="max-h-[70vh] overflow-y-auto bg-white p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Notificações</h2>
                </div>

                {/* Centralizando o botão "Excluir todas" */}
                <div className="flex justify-center mb-4">
                    <button
                        className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 px-6 py-2 rounded-md transition-colors duration-150 ease-in-out"
                        onClick={handleDeleteAllNotifications}
                        disabled={notifications.length === 0}
                    >
                        Excluir todas
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Carregando notificações...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-4 text-red-500">
                        <p>{error}</p>
                        <button
                            onClick={fetchNotifications}
                            className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : notifications.length === 0 ? (
                    <p className="text-center">Nenhuma notificação no momento.</p>
                ) : (
                    <ul className="space-y-2">
                        {notifications.map((notification) => (
                            <li
                                key={notification.id}
                                className={`p-3 rounded-md ${getNotificationColor(notification.type)} relative`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="text-gray-800">{notification.message}</p>
                                        {notification.userInfo && (
                                            <div className="text-xs text-gray-600 mt-1">
                                                {notification.userInfo.name && (
                                                    <span className="font-medium">{notification.userInfo.name}</span>
                                                )}
                                                {notification.userInfo.institution && (
                                                    <span> - {notification.userInfo.institution}</span>
                                                )}
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">{formatDate(notification.createdAt)}</p>
                                    </div>
                                    <button
                                        className="text-red-600 p-2 rounded hover:bg-red-200 transition ml-2"
                                        onClick={() => handleDeleteNotification(notification.id)}
                                        title="Excluir notificação"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default NotificationModal;
