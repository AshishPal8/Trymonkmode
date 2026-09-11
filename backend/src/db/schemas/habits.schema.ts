import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  index
} from 'drizzle-orm/pg-core';
import { users } from './user.schema.js';

export const habits = pgTable('habits', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: varchar('description', { length: 500 }),
  category: varchar('category', { length: 50 }).notNull().default('Productivity'),
  icon: varchar('icon', { length: 50 }).notNull().default('Zap'),
  frequency: varchar('frequency', { length: 50 }).notNull().default('daily'),
  timeFrom: varchar('time_from', { length: 50 }),
  timeTo: varchar('time_to', { length: 50 }),
  reminderEnabled: boolean('reminder_enabled').notNull().default(false),
  reminderTime: varchar('reminder_time', { length: 50 }),
  targetDays: jsonb('target_days').notNull().default([0, 1, 2, 3, 4, 5, 6]),
  completedDates: jsonb('completed_dates').notNull().default([]),
  streak: integer('streak').notNull().default(0),
  bestStreak: integer('best_streak').notNull().default(0),
  lastReminderDate: varchar('last_reminder_date', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('habits_user_id_idx').on(table.userId)
]);