import { z } from 'zod';

export const registerDeviceTokenSchema = z.object({
  fcmToken: z.string().min(10, 'Valid FCM device token is required'),
  deviceType: z.enum(['web', 'ios', 'android']).default('web'),
  userAgent: z.string().optional()
});

export const removeDeviceTokenSchema = z.object({
  fcmToken: z.string().min(1, 'FCM device token is required')
});

export const sendTestNotificationSchema = z.object({
  title: z.string().min(1).default('⚡ Try Monk Mode Notification Test'),
  body: z.string().min(1).default('Push notifications are configured and functioning flawlessly!'),
  type: z.enum(['task_reminder', 'calendar_event', 'habit_reminder', 'focus', 'system']).default('system'),
  data: z.record(z.string()).optional()
});

export type RegisterDeviceTokenInput = z.infer<typeof registerDeviceTokenSchema>;
export type RemoveDeviceTokenInput = z.infer<typeof removeDeviceTokenSchema>;
export type SendTestNotificationInput = z.infer<typeof sendTestNotificationSchema>;

export const inboxQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
  before: z.coerce.number().int().positive().optional(),
});

export const markReadSchema = z.object({
  ids: z.array(z.number().int().positive()).max(100).optional(),
});

export const notificationActionSchema = z.object({
  action: z.enum(['snooze', 'done']),
  kind: z.enum(['task', 'habit']),
  refId: z.number().int().positive(),
  minutes: z.number().int().min(1).max(240).optional(),
});

export const broadcastSchema = z.object({
  title: z.string().trim().min(1).max(80),
  body: z.string().trim().min(1).max(200),
  audience: z.enum(['all', 'free', 'paid']).default('all'),
  moduleId: z.string().max(50).optional(),
});

export type InboxQueryInput = z.infer<typeof inboxQuerySchema>;
export type MarkReadInput = z.infer<typeof markReadSchema>;
export type NotificationActionInput = z.infer<typeof notificationActionSchema>;
export type BroadcastInput = z.infer<typeof broadcastSchema>;
