import axios from 'axios';

export const sendExpoPushNotification = async (pushToken: string, title: string, body: string, data?: any) => {
    try {
        const message = {
            to: pushToken,
            sound: 'default',  
            title,
            body,
            data: data || { type: 'notification' },
            android: {
                icon: 'ic_notification',  
                color: '#FF6347',  
            },
            ios: {
                sound: 'default', 
            },
        };

        console.log('Enviando notificação:', message);  

        const response = await axios.post('https://exp.host/--/api/v2/push/send', message, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        console.log('Notificação Expo enviada com sucesso:', response.data);  
    } catch (error) {
        console.error('Erro ao enviar notificação Expo:', error.response?.data || error.message);
    }
};
