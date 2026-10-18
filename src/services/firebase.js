import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { notificationApi } from '@/api/notification.api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let app = null;
let messaging = null;

export function getFirebaseMessaging() {
  if (typeof window === 'undefined') return null;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return null;
  }
  if (!firebaseConfig.apiKey) {
    return null;
  }

  if (!app) {
    const apps = getApps();
    app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  }

  if (!messaging) {
    try {
      messaging = getMessaging(app);
    } catch (err) {
      console.warn('[FCM] Error obtaining web messaging instance:', err);
    }
  }

  return messaging;
}

let isNativeListenersAttached = false;

function initNativePushListeners() {
  if (!Capacitor.isNativePlatform() || isNativeListenersAttached) return;
  isNativeListenersAttached = true;

  // Create default and reminder notification channels with highest priority for Android 8.0+
  PushNotifications.createChannel({
    id: 'trackdeal_default',
    name: 'TrackDeal Notifications',
    description: 'Notifications for lead alerts, updates, and activities',
    importance: 5,
    visibility: 1,
    vibration: true,
  }).catch((err) => {
    console.warn('[FCM-Native] Channel creation notice:', err);
  });

  PushNotifications.createChannel({
    id: 'trackdeal_reminders',
    name: 'Task & Follow-up Reminders',
    description: 'Timely reminders for scheduled student callbacks and upcoming tasks',
    importance: 5,
    visibility: 1,
    vibration: true,
  }).catch((err) => {
    console.warn('[FCM-Native] Reminders channel creation notice:', err);
  });

  PushNotifications.addListener('registration', async (tokenObj) => {
    const token = tokenObj?.value;
    console.info('[FCM-Native] Push registration success, token received:', token);
    if (token) {
      try {
        localStorage.setItem('trackdeal_fcm_token', token);
      } catch (_) {}
      try {
        await notificationApi.registerDeviceToken(token, 'android');
        console.info('[FCM-Native] Device token registered with TrackDeal backend successfully.');
      } catch (err) {
        console.warn('[FCM-Native] Failed registering token with backend:', err?.message || err);
      }
    }
  });

  PushNotifications.addListener('registrationError', (err) => {
    console.error('[FCM-Native] Registration error:', err);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.info('[FCM-Native] Push action performed:', notification);
    const data = notification?.notification?.data || {};
    const targetUrl = data.actionUrl || data.url || '/notifications';
    if (typeof window !== 'undefined' && targetUrl) {
      if (window.$router) {
        window.$router.push(targetUrl).catch(() => {});
      } else {
        window.location.hash = targetUrl;
      }
    }
  });
}

// Attach listener early on native platform
if (Capacitor.isNativePlatform()) {
  initNativePushListeners();
}

/**
 * Prompts user for push notification permissions, registers with FCM (Native Android or Web),
 * and synchronizes device token to the TrackDeal backend.
 *
 * @returns {Promise<string|boolean|null>} FCM Device Token if granted, else null
 */
export async function requestPushNotificationPermission() {
  // ── Native Mobile App (Capacitor Android) ──────────────────────────────────
  if (Capacitor.isNativePlatform()) {
    try {
      initNativePushListeners();
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive !== 'granted') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.info('[FCM-Native] Push notification permission not granted:', permStatus);
        return null;
      }

      // Sync cached token with backend if available
      const cachedToken = localStorage.getItem('trackdeal_fcm_token');
      if (cachedToken) {
        notificationApi.registerDeviceToken(cachedToken, 'android').catch((err) => {
          console.warn('[FCM-Native] Sync cached token notice:', err?.message || err);
        });
      }

      await PushNotifications.register();
      return true;
    } catch (err) {
      console.error('[FCM-Native] Native push initialization failed:', err);
      return null;
    }
  }

  // ── Web Browser (Desktop / Mobile Browser) ─────────────────────────────────
  const messagingInstance = getFirebaseMessaging();
  if (!messagingInstance) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.info('[FCM] Notification permission was not granted:', permission);
      return null;
    }

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const token = await getToken(messagingInstance, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      try {
        await notificationApi.registerDeviceToken(token, 'web');
        console.info('[FCM] Device token registered with backend successfully.');
      } catch (err) {
        console.warn('[FCM] Device token registration skipped/failed:', err?.message || err);
      }
      return token;
    }
  } catch (err) {
    console.error('[FCM] Failed to initialize web push notifications:', err);
  }
  return null;
}

/**
 * Listens for foreground messages received while the user has the app open.
 *
 * @param {Function} callback Handler callback receiving payload
 * @returns {Function} Unsubscribe function
 */
export function onForegroundNotification(callback) {
  if (Capacitor.isNativePlatform()) {
    const listenerPromise = PushNotifications.addListener('pushNotificationReceived', (notification) => {
      if (callback) {
        const image =
          notification.image ||
          notification.data?.imageUrl ||
          notification.data?.image ||
          notification.data?.picture ||
          null;
        callback({
          notification: {
            title: notification.title,
            body: notification.body,
            image,
          },
          data: notification.data,
        });
      }
    });

    return () => {
      listenerPromise.then((handle) => handle.remove()).catch(() => {});
    };
  }

  const messagingInstance = getFirebaseMessaging();
  if (!messagingInstance) return () => {};

  return onMessage(messagingInstance, (payload) => {
    if (callback) {
      callback(payload);
    }
  });
}

/**
 * Checks current push notification permission status across Web and Native.
 * @returns {Promise<'granted'|'denied'|'default'|'prompt'>}
 */
export async function checkPushPermissionStatus() {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await PushNotifications.checkPermissions();
      if (status.receive === 'prompt' || status.receive === 'prompt-with-rationale') {
        return 'prompt';
      }
      return status.receive;
    } catch {
      return 'prompt';
    }
  }
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }
  return 'denied';
}

/**
 * Automatically syncs device push token with backend if permission has already been granted.
 * Completely non-intrusive: never triggers any prompt if permission is not yet granted.
 */
export async function syncPushTokenIfPermissionGranted() {
  try {
    const status = await checkPushPermissionStatus();
    if (status === 'granted') {
      return await requestPushNotificationPermission();
    }
  } catch (err) {
    console.warn('[FCM] Push token background sync notice:', err?.message || err);
  }
  return null;
}

