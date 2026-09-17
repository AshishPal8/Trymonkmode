import {
  initializeApp,
  getApps,
  cert,
  type ServiceAccount,
} from "firebase-admin/app";
import { getMessaging, type SendResponse } from "firebase-admin/messaging";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "../../config/db.js";
import {
  userDeviceTokens,
  notificationLogs,
  userSettings,
} from "../../db/schema.js";
import type { RegisterDeviceTokenInput } from "./notifications.schema.js";

let isFirebaseInitialized = false;

function initFirebaseAdmin(): boolean {
  if (isFirebaseInitialized) return true;

  try {
    if (getApps().length > 0) {
      isFirebaseInitialized = true;
      return true;
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (serviceAccountKey) {
      let parsedCreds: ServiceAccount;
      if (serviceAccountKey.startsWith("{")) {
        parsedCreds = JSON.parse(serviceAccountKey);
      } else {
        const decoded = Buffer.from(serviceAccountKey, "base64").toString(
          "utf-8",
        );
        parsedCreds = JSON.parse(decoded);
      }

      initializeApp({
        credential: cert(parsedCreds),
      });
      isFirebaseInitialized = true;
      console.log(
        "⚡ [Notifications] Firebase Admin initialized successfully via Service Account Key.",
      );
      return true;
    } else if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      isFirebaseInitialized = true;
      console.log(
        "⚡ [Notifications] Firebase Admin initialized successfully via Environment Variables.",
      );
      return true;
    }

    console.warn(
      "⚠️ [Notifications] Firebase Admin credentials not found. Push notifications will run in mock/log mode.",
    );
    return false;
  } catch (error) {
    console.error(
      "❌ [Notifications] Failed to initialize Firebase Admin:",
      error,
    );
    return false;
  }
}

// Auto-attempt initialization on load
initFirebaseAdmin();

export async function registerDeviceTokenService(
  userId: number,
  input: RegisterDeviceTokenInput,
) {
  const existing = await db
    .select()
    .from(userDeviceTokens)
    .where(
      and(
        eq(userDeviceTokens.userId, userId),
        eq(userDeviceTokens.fcmToken, input.fcmToken),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(userDeviceTokens)
      .set({
        deviceType: input.deviceType,
        userAgent: input.userAgent || null,
        updatedAt: new Date(),
      })
      .where(eq(userDeviceTokens.id, existing[0].id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(userDeviceTokens)
    .values({
      userId,
      fcmToken: input.fcmToken,
      deviceType: input.deviceType,
      userAgent: input.userAgent || null,
    })
    .returning();

  return created;
}

export async function removeDeviceTokenService(
  userId: number,
  fcmToken: string,
) {
  await db
    .delete(userDeviceTokens)
    .where(
      and(
        eq(userDeviceTokens.userId, userId),
        eq(userDeviceTokens.fcmToken, fcmToken),
      ),
    );
  return { message: "Device token removed successfully." };
}

export async function getUserTokensService(userId: number) {
  return db
    .select()
    .from(userDeviceTokens)
    .where(eq(userDeviceTokens.userId, userId));
}

export async function sendPushNotificationToUser(
  userId: number,
  payload: {
    title: string;
    body: string;
    type?:
      | "task_reminder"
      | "calendar_event"
      | "habit_reminder"
      | "focus"
      | "system";
    data?: Record<string, string>;
  },
) {
  const type = payload.type || "system";
  const data = payload.data || {};

  // Check if user has notificationsEnabled in settings
  const [settings] = await db
    .select({ notificationsEnabled: userSettings.notificationsEnabled })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  if (settings && settings.notificationsEnabled === false) {
    console.log(
      `🔕 [Notifications] Push suppressed for user ${userId} because notificationsEnabled is false in settings.`,
    );
    return {
      success: true,
      deliveredDevices: 0,
      status: "suppressed_by_preference",
    };
  }

  const tokensRecord = await getUserTokensService(userId);
  const fcmTokens = tokensRecord.map((t) => t.fcmToken);

  let sendStatus = "sent";

  if (fcmTokens.length > 0 && initFirebaseAdmin()) {
    try {
      const response = await getMessaging().sendEachForMulticast({
        tokens: fcmTokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: {
          ...data,
          title: payload.title,
          body: payload.body,
          type,
          timestamp: new Date().toISOString(),
        },
        webpush: {
          fcmOptions: {
            link: "https://trymonkmode.in",
          },
          notification: {
            title: payload.title,
            body: payload.body,
            icon: "/icon.png",
            badge: "/icon.png",
            requireInteraction: true,
          },
        },
      });

      console.log(
        `⚡ [Notifications] Dispatched push to user ${userId} (${fcmTokens.length} tokens). Success: ${response.successCount}, Failure: ${response.failureCount}`,
      );

      // Cleanup invalid / expired tokens automatically
      const failedTokens: string[] = [];
      response.responses.forEach((resp: SendResponse, idx: number) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          console.warn(
            `⚠️ [Notifications] Token ${idx} delivery failed:`,
            resp.error?.message,
            resp.error?.code,
          );
          if (
            errCode === "messaging/registration-token-not-registered" ||
            errCode === "messaging/invalid-registration-token" ||
            errCode === "messaging/invalid-argument"
          ) {
            failedTokens.push(fcmTokens[idx]);
          }
        }
      });

      if (failedTokens.length > 0) {
        await db
          .delete(userDeviceTokens)
          .where(
            and(
              eq(userDeviceTokens.userId, userId),
              inArray(userDeviceTokens.fcmToken, failedTokens),
            ),
          );
      }
    } catch (err) {
      console.error(
        `❌ [Notifications] Failed sending push to user ${userId}:`,
        err,
      );
      sendStatus = "failed";
    }
  } else {
    // Mock / dev logging mode
    console.log(
      `🔔 [Mock Push Notification to User ${userId}] [${type}] ${payload.title} - ${payload.body} (Tokens: ${fcmTokens.length})`,
    );
  }

  // Record into audit log
  await db.insert(notificationLogs).values({
    userId,
    title: payload.title,
    body: payload.body,
    type,
    data,
    status: sendStatus,
  });

  return {
    success: true,
    deliveredDevices: fcmTokens.length,
    status: sendStatus,
  };
}
