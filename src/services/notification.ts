import { Platform, PermissionsAndroid } from 'react-native';
import PushNotification from 'react-native-push-notification';

let initialized = false;

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }
  return true;
}

export function initNotification() {
  if (initialized) return;
  initialized = true;

  PushNotification.configure({
    onNotification(_notification: any) {
      // handled by system
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: true,
    requestPermissions: false,
  });

  PushNotification.createChannel(
    {
      channelId: 'im_messages',
      channelName: '消息通知',
      channelDescription: '接收新消息通知',
      importance: 4,
      vibrate: true,
    },
    () => {},
  );
}

export function showNotification(title: string, message: string) {
  if (!initialized) return;

  PushNotification.localNotification({
    channelId: 'im_messages',
    title,
    message,
    smallIcon: 'ic_notification',
    largeIcon: '',
    playSound: true,
    soundName: 'default',
    vibrate: true,
    priority: 'high',
    visibility: 'public',
    autoCancel: true,
  });
}
