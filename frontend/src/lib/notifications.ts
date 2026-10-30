'use client';

import { notificationsApi } from './api';

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    return registration;
  } catch (error) {
    console.warn('Service Worker registration failed:', error);
    return null;
  }
}

export async function requestPushNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerServiceWorker();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

const TOKEN_KEY = 'trymonk_fcm_token';
const TOKEN_SYNCED_AT_KEY = 'trymonk_fcm_token_synced_at';
// Re-send the token once a day even if it hasn't changed, in case the
// backend removed it (e.g. it was briefly invalid).
const RESYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;

export async function syncFCMDeviceToken(fcmToken: string, deviceType: 'web' | 'ios' | 'android' = 'web') {
  if (!fcmToken) return;

  try {
    const existingToken = localStorage.getItem(TOKEN_KEY);
    const syncedAt = Number(localStorage.getItem(TOKEN_SYNCED_AT_KEY) || 0);
    if (existingToken === fcmToken && Date.now() - syncedAt < RESYNC_INTERVAL_MS) {
      return;
    }

    await notificationsApi.registerDeviceToken(fcmToken, deviceType);
    localStorage.setItem(TOKEN_KEY, fcmToken);
    localStorage.setItem(TOKEN_SYNCED_AT_KEY, String(Date.now()));
  } catch (error) {
    console.warn('Failed to sync FCM device token with Try Monk Mode backend:', error);
  }
}

export async function unregisterFCMDeviceToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    try {
      await notificationsApi.removeDeviceToken(token);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_SYNCED_AT_KEY);
    } catch (e) {
      console.warn('Failed removing device token:', e);
    }
  }
}
