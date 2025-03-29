import axios from 'axios';

export const sendExpoPushNotification = async (pushToken: string, title: string, body: string, data?: any) => {
    try {
        const message = {
            to: pushToken,
            sound: 'default',
            title,
            body,
            data: data || { type: 'notification' },
        };

        console.log('Enviando notificação:', message);  // Log para verificar a mensagem sendo enviada

        const response = await axios.post('https://exp.host/--/api/v2/push/send', message, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        console.log('Notificação Expo enviada com sucesso:', response.data);  // Log para verificar resposta da API
    } catch (error) {
        console.error('Erro ao enviar notificação Expo:', error.response?.data || error.message);
    }
};
