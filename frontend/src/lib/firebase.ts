import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";
import { syncFCMDeviceToken } from "./notifications";

const cleanEnv = (val?: string) => val ? val.replace(/^["']|["']$/g, '').trim() : '';

export const firebaseConfig = {
  apiKey: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  measurementId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) || undefined
};

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    return null;
  }

  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === "undefined") return null;

  try {
    const app = getFirebaseApp();
    if (!app) return null;
    return getMessaging(app);
  } catch (error) {
    console.warn("FCM Messaging not supported in this browser environment:", error);
    return null;
  }
}

export async function requestAndRegisterFCMToken(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window) || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission was not granted by user:", permission);
      return null;
    }

    const messaging = getFirebaseMessaging();
    if (!messaging) return null;

    // Register service worker explicitly for FCM
    let swRegistration: ServiceWorkerRegistration | undefined;
    if ("serviceWorker" in navigator) {
      swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
        scope: "/"
      });
    }

    const vapidKey = cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);

    const token = await getToken(messaging, {
      vapidKey: vapidKey || undefined,
      serviceWorkerRegistration: swRegistration
    });

    if (token) {
      await syncFCMDeviceToken(token, "web");
      return token;
    }

    return null;
  } catch (error: any) {
    if (error?.message?.includes("API key not valid") || error?.code === "installations/request-failed") {
      console.warn(
        "⚠️ [FCM] Firebase Web API Key needs activation or API restrictions check in Google Cloud Console:\n" +
        "1. Go to console.cloud.google.com > APIs & Services > Credentials.\n" +
        "2. Find Browser Key / Web API Key > Ensure 'Firebase Installations API' & 'Firebase Cloud Messaging API' are allowed, or set to 'Don't restrict key'.\n" +
        "3. Check Application restrictions > Ensure localhost is allowed or set to None."
      );
    } else {
      console.error("❌ [FCM] Error obtaining device token:", error);
    }
    return null;
  }
}

export function setupForegroundNotificationListener(onReceive: (payload: any) => void) {
  const messaging = getFirebaseMessaging();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    onReceive(payload);
  });
}
