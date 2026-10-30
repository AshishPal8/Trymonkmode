import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './user.schema.js';

export const userDeviceTokens = pgTable('user_device_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fcmToken: text('fcm_token').notNull(),
  deviceType: varchar('device_type', { length: 50 }).notNull().default('web'), // 'web' | 'ios' | 'android'
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('device_tokens_user_id_idx').on(table.userId),
  uniqueIndex('device_tokens_user_fcm_idx').on(table.userId, table.fcmToken)
]);

export const notificationLogs = pgTable('notification_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  type: varchar('type', { length: 50 }).notNull().default('general'), // 'task_reminder' | 'calendar_event' | 'habit_reminder' | 'focus' | 'system'
  data: jsonb('data').notNull().default({}),
  status: varchar('status', { length: 50 }).notNull().default('sent'), // 'sent' | 'failed' | 'no_devices' | 'in_app'
  // Set when the user has seen it in the in-app inbox
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('notification_logs_user_id_idx').on(table.userId),
  // Inbox: newest first for one user
  index('notification_logs_user_created_idx').on(table.userId, table.id),
  // Unread badge count
  index('notification_logs_unread_idx')
    .on(table.userId)
    .where(sql`${table.readAt} IS NULL`),
  // Used by the nightly cleanup (delete older than 30 days)
  index('notification_logs_created_at_idx').on(table.createdAt)
]);

// One row per item that has a reminder (a task, event or habit). The worker
// polls this every minute, so it is the only place reminders are scheduled.
// Habits reuse their row: after sending, send_at moves to the next occurrence.
export const scheduledNotifications = pgTable('scheduled_notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: varchar('kind', { length: 20 }).notNull(), // 'task' | 'event' | 'habit' | 'habit_snooze' (one-off snooze of today's habit)
  refId: integer('ref_id').notNull(), // id of the task / event / habit
  sendAt: timestamp('send_at', { withTimezone: true }).notNull(),
  // When the thing itself happens (due time / start time / habit time).
  // Messages use it to say "in 10 min" vs "now".
  targetAt: timestamp('target_at', { withTimezone: true }).notNull(),
  // Habits: the local date (YYYY-MM-DD) this occurrence is for.
  occurrenceDate: varchar('occurrence_date', { length: 10 }),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending' | 'processing' | 'sent' | 'skipped' | 'failed'
  lockedAt: timestamp('locked_at', { withTimezone: true }),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('scheduled_notifications_item_idx').on(table.kind, table.refId),
  // The worker's only query: pending rows that are due
  index('scheduled_notifications_due_idx')
    .on(table.sendAt)
    .where(sql`${table.status} = 'pending'`),
  index('scheduled_notifications_user_idx').on(table.userId)
]);
