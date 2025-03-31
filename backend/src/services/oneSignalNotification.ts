import OneSignal from 'onesignal-node';

const client = new OneSignal.Client({
  appId: process.env.ONESIGNAL_APP_ID, // Adicione ao seu .env
  restApiKey: process.env.ONESIGNAL_REST_API_KEY, // Adicione ao seu .env
});

export const sendOneSignalNotification = async (playerId: string, title: string, body: string, data?: any) => {
  try {
    const notification = {
      include_player_ids: [playerId],
      headings: { en: title },
      contents: { en: body },
      data: data || { type: 'notification' },
      // Opcional: Adicionar imagem
      big_picture: data?.imageUrl || undefined, 
    };

    const response = await client.createNotification(notification);
    console.log('Notificação OneSignal enviada com sucesso:', response.body);
  } catch (error) {
    console.error('Erro ao enviar notificação OneSignal:', error.response?.data || error.message);
  }
};