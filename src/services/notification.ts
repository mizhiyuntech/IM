import { Platform, PermissionsAndroid, NativeModules } from 'react-native';

const { IMNotification } = NativeModules;

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

  if (IMNotification) {
    IMNotification.createChannel();
  }
}

export function showNotification(title: string, message: string) {
  if (!initialized) return;

  if (IMNotification) {
    IMNotification.showNotification(title, message);
  }
}
