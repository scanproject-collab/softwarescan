import * as OneSignal from '@onesignal/node-onesignal';

interface NotificationData {
  imageUrl?: string;
  type?: string;
  [key: string]: any;
}

const configuration = OneSignal.createConfiguration({
  restApiKey: process.env.ONESIGNAL_REST_API_KEY || "your_one_signal_rest_api_key",
});

const client = new OneSignal.DefaultApi(configuration);

export const sendOneSignalNotification = async (playerId: string, title: string, body: string, data?: NotificationData) => {
  try {
    const notification = new OneSignal.Notification({
      app_id: process.env.ONESIGNAL_APP_ID || "your_one_signal_app_id",
      include_player_ids: [playerId],
      headings: { en: title },
      contents: { en: body },
      data: data || { type: 'notification' },
      big_picture: data?.imageUrl || undefined,
    });

    const response = await client.createNotification(notification);
    console.log('OneSignal notification sent successfully:', response);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error sending OneSignal notification:', error.message);
    } else {
      console.error('Error sending OneSignal notification:', error);
    }
  }
};