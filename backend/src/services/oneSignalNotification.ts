import { from } from "@onesignal/node-onesignal/dist/rxjsStub";
import * as OneSignal from 'onesignal-node'; 


interface NotificationData {
  imageUrl?: string;
  type?: string;
  [key: string]: any;
}

const client = new OneSignal.Client(
  process.env.ONESIGNAL_APP_ID!,
  process.env.ONESIGNAL_REST_API_KEY!
);

export const sendOneSignalNotification = async (playerId: string, title: string, body: string, data?: NotificationData) => {
  const notification = { 
    contents: { en: body },
    headings: { en: title },
    include_player_ids: [playerId],
    data: data || { type: 'notification' }, 
    big_picture: data?.imageUrl || undefined,
  };

  try {
    console.log('Sending notification object:', notification);
    const response = await client.createNotification(notification);
    if (response.body.errors?.includes('All included players are not subscribed')) {
      throw new Error('User is not subscribed to notifications');
    }
    console.log('OneSignal notification sent successfully:', response.body); 
  } catch (error: any) {
    if (error instanceof OneSignal.HTTPError) {
      console.error('Error sending OneSignal notification:', error.statusCode, error.body);
    } else {
      console.error('Generic error sending OneSignal notification:', error.message || error);
    }
    throw error; 
  }
};