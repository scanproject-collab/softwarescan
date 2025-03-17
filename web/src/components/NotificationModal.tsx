import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog.tsx';
import api from '../services/api';
import { Bell } from 'lucide-react';

interface Notification {
    id: string;
    type: string;
    message: string;
    createdAt: string;
}

const NotificationModal: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get('/admin/notifications');
                const allNotifications = response.data.notifications.map((notif: any) => ({
                    id: notif.id,
                    type: notif.type,
                    message: notif.message,
                    createdAt: notif.createdAt,
                }));
                setNotifications(allNotifications);
            } catch (error) {
                console.error('Erro ao buscar notificações:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            onOpen();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button className="relative focus:outline-none">
                    <Bell className="h-6 w-6 text-white" />
                    {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {notifications.length}
            </span>
                    )}
                </button>
            </DialogTrigger>
            <DialogContent className="max-h-[70vh] overflow-y-auto bg-white p-4">
                <h2 className="mb-4 text-lg font-bold">Notificações</h2>
                {notifications.length === 0 ? (
                    <p>Nenhuma notificação no momento.</p>
                ) : (
                    <ul className="space-y-2">
                        {notifications.map((notification) => (
                            <li
                                key={notification.id}
                                className={`p-2 rounded-md ${
                                    notification.type === 'pending'
                                        ? 'bg-yellow-100'
                                        : notification.type === 'approved'
                                            ? 'bg-green-100'
                                            : 'bg-red-100' // Para 'rejected', 'expired', e 'deleted'
                                }`}
                            >
                                <p>{notification.message}</p>
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