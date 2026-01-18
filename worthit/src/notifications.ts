import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) return false;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export type ReminderPayload = {
  itemId: string;
};

export const scheduleReminder = async (
  date: Date,
  payload: ReminderPayload,
  title: string,
  body: string
) => {
  // Ensure local notifications display as expected on Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: payload,
    },
    trigger: date,
  });
};

export const setNotificationHandlers = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
};

