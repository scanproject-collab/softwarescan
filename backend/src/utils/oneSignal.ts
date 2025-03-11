import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const sendNotification = async (
    playerIds: string[],
    message: string,
    data?: Record<string, any>
) => {
  try {
    const response = await axios.post(
        'https://onesignal.com/api/v1/notifications',
        {
          app_id: process.env.ONESIGNAL_APP_ID,
          include_player_ids: playerIds,
          contents: { en: message },
          data,
        },
        {
          headers: {
            Authorization: `Basic ${process.env.ONESIGNAL_API_KEY!}`,
            'Content-Type': 'application/json',
          },
        }
    );
    console.log('Notification sent successfully:', response.data);
  } catch (error: any) {
    if (error instanceof Error) {
      console.error('Error sending notification:', (error as any).response?.data || error.message);
    } else {
      console.error('Error sending notification:', error);
    }
  }
};