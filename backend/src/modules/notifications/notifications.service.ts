import {
  initializeApp,
  getApps,
  cert,
  type ServiceAccount,
} from "firebase-admin/app";
import { getMessaging, type SendResponse } from "firebase-admin/messaging";
import { eq, and, ne, inArray } from "drizzle-orm";
import { env } from "../../config/env.js";
import { db } from "../../config/db.js";
import {
  users,
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
  // A browser keeps the same FCM token across logins. Remove it from any other
  // account first, so a user never gets pushes meant for someone else.
  await db
    .delete(userDeviceTokens)
    .where(
      and(
        eq(userDeviceTokens.fcmToken, input.fcmToken),
        ne(userDeviceTokens.userId, userId),
      ),
    );

  const [row] = await db
    .insert(userDeviceTokens)
    .values({
      userId,
      fcmToken: input.fcmToken,
      deviceType: input.deviceType,
      userAgent: input.userAgent || null,
    })
    .onConflictDoUpdate({
      target: [userDeviceTokens.userId, userDeviceTokens.fcmToken],
      set: {
        deviceType: input.deviceType,
        userAgent: input.userAgent || null,
        updatedAt: new Date(),
      },
    })
    .returning();

  return row;
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

export type NotificationType =
  | "task_reminder"
  | "calendar_event"
  | "habit_reminder"
  | "focus"
  | "system";

export type PushPayload = {
  title: string;
  body: string;
  type?: NotificationType;
  data?: Record<string, string>;
};

export type DeliveryStatus = "sent" | "failed" | "no_devices";

const INVALID_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
  "messaging/invalid-argument",
]);

/**
 * Sends one push to the given device tokens and removes tokens FCM says are
 * dead. Does not check preferences or write logs: callers do that, so the
 * reminder worker can batch those queries for many users at once.
 */
export async function deliverPush(
  userId: number,
  fcmTokens: string[],
  payload: PushPayload,
): Promise<{ status: DeliveryStatus; successCount: number }> {
  const type = payload.type || "system";
  const data = payload.data || {};

  if (fcmTokens.length === 0) return { status: "no_devices", successCount: 0 };

  if (!initFirebaseAdmin()) {
    console.log(
      `🔔 [Mock Push to User ${userId}] [${type}] ${payload.title} - ${payload.body}`,
    );
    return { status: "sent", successCount: 0 };
  }

  // Same tag = a newer push for the same item replaces the old one
  // instead of stacking up.
  const refId = data.taskId || data.eventId || data.habitId || "";
  const tag = refId ? `${type}-${refId}` : type;
  const link = data.moduleId
    ? `${env.FRONTEND_URL}/?module=${encodeURIComponent(data.moduleId)}`
    : env.FRONTEND_URL;
  // Only events need to stay on screen until dismissed.
  const requireInteraction = type === "calendar_event";

  try {
    const response = await getMessaging().sendEachForMulticast({
      tokens: fcmTokens,
      notification: { title: payload.title, body: payload.body },
      data: {
        ...data,
        title: payload.title,
        body: payload.body,
        type,
        tag,
        link,
        requireInteraction: String(requireInteraction),
        timestamp: new Date().toISOString(),
      },
      webpush: {
        fcmOptions: { link },
        notification: {
          title: payload.title,
          body: payload.body,
          icon: "/icon.png",
          badge: "/icon.png",
          tag,
          requireInteraction,
        },
      },
    });

    const deadTokens: string[] = [];
    response.responses.forEach((resp: SendResponse, idx: number) => {
      if (!resp.success && INVALID_TOKEN_CODES.has(resp.error?.code || "")) {
        deadTokens.push(fcmTokens[idx]);
      }
    });

    if (response.failureCount > 0) {
      console.warn(
        `⚠️ [Notifications] user ${userId}: ${response.successCount}/${fcmTokens.length} delivered, ${deadTokens.length} dead tokens removed.`,
      );
    }

    if (deadTokens.length > 0) {
      await db
        .delete(userDeviceTokens)
        .where(
          and(
            eq(userDeviceTokens.userId, userId),
            inArray(userDeviceTokens.fcmToken, deadTokens),
          ),
        );
    }

    return {
      status: response.successCount > 0 ? "sent" : "failed",
      successCount: response.successCount,
    };
  } catch (err) {
    console.error(`❌ [Notifications] Failed sending push to user ${userId}:`, err);
    return { status: "failed", successCount: 0 };
  }
}

/** Sends a push to one user, checking their preference first. Writes a log row. */
export async function sendPushNotificationToUser(
  userId: number,
  payload: PushPayload,
) {
  const type = payload.type || "system";
  const data = payload.data || {};

  // One query: the user's preference plus all their device tokens.
  const rows = await db
    .select({
      notificationsEnabled: userSettings.notificationsEnabled,
      fcmToken: userDeviceTokens.fcmToken,
    })
    .from(users)
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    .leftJoin(userDeviceTokens, eq(userDeviceTokens.userId, users.id))
    .where(eq(users.id, userId));

  if (rows.length === 0) {
    return { success: false, deliveredDevices: 0, status: "user_not_found" };
  }

  if (rows[0].notificationsEnabled === false) {
    return {
      success: true,
      deliveredDevices: 0,
      status: "suppressed_by_preference",
    };
  }

  const fcmTokens = rows
    .map((r) => r.fcmToken)
    .filter((t): t is string => Boolean(t));

  const { status, successCount } = await deliverPush(userId, fcmTokens, payload);

  // Audit log (also the source for an in-app inbox later). Not awaited so it
  // never delays the caller.
  db.insert(notificationLogs)
    .values({ userId, title: payload.title, body: payload.body, type, data, status })
    .catch((err) => console.error("❌ [Notifications] Failed to write log:", err));

  return {
    success: status !== "failed",
    deliveredDevices: successCount,
    status,
  };
}
