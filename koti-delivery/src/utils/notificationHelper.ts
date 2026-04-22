import Constants from 'expo-constants';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  let token;
  const Notifications = require('expo-notifications');
  const Device = require('expo-device');

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice || __DEV__) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    try {
      const projectId = 
        Constants?.expoConfig?.extra?.eas?.projectId ?? 
        Constants?.easConfig?.projectId;
        
      if (projectId) {
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Push Token:', token);
      } else {
        console.log('No Project ID found for push notifications. Token sync skipped.');
      }
    } catch (e: any) {
      console.warn('Push token retrieval skipped:', e.message);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function sendLocalNotification(title: string, body: string, data?: any) {
  try {
    const Notifications = require('expo-notifications');
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
      },
      trigger: null,
    });
  } catch (error: any) {
    throw new Error("Notification system not ready. Please rebuild the app.");
  }
}
