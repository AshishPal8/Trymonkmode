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
  status: varchar('status', { length: 50 }).notNull().default('sent'), // 'sent' | 'failed'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('notification_logs_user_id_idx').on(table.userId)
]);
