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

export async function syncFCMDeviceToken(fcmToken: string, deviceType: 'web' | 'ios' | 'android' = 'web') {
  if (!fcmToken) return;

  try {
    const existingToken = localStorage.getItem('trymonk_fcm_token');
    if (existingToken === fcmToken) {
      // Already synced recently
      return;
    }

    await notificationsApi.registerDeviceToken(fcmToken, deviceType);
    localStorage.setItem('trymonk_fcm_token', fcmToken);
  } catch (error) {
    console.warn('Failed to sync FCM device token with Try Monk Mode backend:', error);
  }
}

export async function unregisterFCMDeviceToken() {
  const token = localStorage.getItem('trymonk_fcm_token');
  if (token) {
    try {
      await notificationsApi.removeDeviceToken(token);
      localStorage.removeItem('trymonk_fcm_token');
    } catch (e) {
      console.warn('Failed removing device token:', e);
    }
  }
}
