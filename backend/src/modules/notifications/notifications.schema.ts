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
