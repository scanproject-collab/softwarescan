import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog.tsx';
import api from '../services/api';
import { Bell } from 'lucide-react';

interface Notification {
    id: string;
    type: string;
    message: string;
    createdAt: string;
    read: boolean;
}

const NotificationModal: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [deletedNotifications, setDeletedNotifications] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Função para buscar notificações
    const fetchNotifications = async () => {
        try {
            const response = await api.get('/admin/notifications');
            let fetchedNotifications: Notification[] = response.data.notifications.map((notif: any) => ({
                id: notif.id,
                type: notif.type,
                message: notif.message,
                createdAt: notif.createdAt,
                read: notif.read || false,
            }));

            // Carrega as notificações lidas e deletadas do localStorage
            const savedReadNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
            const savedDeletedNotifications = JSON.parse(localStorage.getItem('deletedNotifications') || '[]');

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
        }
    };

    // Efeito para buscar notificações e manter estado atualizado
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Função para abrir e marcar todas como lidas no frontend
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            onOpen(); // Reseta a contagem na Navbar
            const readIds = notifications.map(n => n.id);
            localStorage.setItem('readNotifications', JSON.stringify(readIds));
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
        localStorage.setItem('deletedNotifications', JSON.stringify(allIds));
    };

    // Apagar uma notificação específica
    const handleDeleteNotification = (id: string) => {
        const updatedDeletedNotifications = [...deletedNotifications, id];
        setDeletedNotifications(updatedDeletedNotifications);
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        localStorage.setItem('deletedNotifications', JSON.stringify(updatedDeletedNotifications));
    };

    // Definir cores das notificações por tipo
    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'pending': return 'bg-yellow-100';
            case 'approved': return 'bg-green-100';
            case 'rejected': return 'bg-red-100';
            default: return 'bg-gray-200';
        }
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
        >
            Excluir todas
        </button>
    </div>

    {notifications.length === 0 ? (
        <p className="text-center">Nenhuma notificação no momento.</p>
    ) : (
        <ul className="space-y-2">
            {notifications.map((notification) => (
                <li
                    key={notification.id}
                    className={`p-2 rounded-md ${getNotificationColor(notification.type)} relative`}
                >
                    <div className="flex justify-between items-center">
                        <p>{notification.message}</p>
                        <button
                            className="text-red-600 p-2 rounded hover:bg-red-200 transition"
                            onClick={() => handleDeleteNotification(notification.id)}
                        >
                            <span className="text-lg">&times;</span>
                        </button>
                    </div>
                    <p className="text-sm text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
                </li>
            ))}
        </ul>
    )}
</DialogContent>
        </Dialog>
    );
};

export default NotificationModal;
