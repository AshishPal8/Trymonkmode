import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  jsonb,
  index
} from 'drizzle-orm/pg-core';
import { users } from './user.schema.js';

export const habits = pgTable('habits', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  category: varchar('category', { length: 50 }).notNull().default('Productivity'),
  frequency: varchar('frequency', { length: 50 }).notNull().default('daily'),
  targetDays: jsonb('target_days').notNull().default([0, 1, 2, 3, 4, 5, 6]),
  completedDates: jsonb('completed_dates').notNull().default([]),
  streak: integer('streak').notNull().default(0),
  bestStreak: integer('best_streak').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('habits_user_id_idx').on(table.userId)
]);