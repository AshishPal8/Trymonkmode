import { pgTable, serial, integer, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './user.schema.js';

// A missed day the user chose to "repair" so their streak continues.
export const streakRepairs = pgTable('streak_repairs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  repairedDate: varchar('repaired_date', { length: 10 }).notNull(), // YYYY-MM-DD (user's timezone)
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('streak_repairs_user_date_idx').on(table.userId, table.repairedDate)
]);

// XP bonus for being active on 5+ days in a week. One row per user per week.
export const consistencyBonuses = pgTable('consistency_bonuses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  weekStart: varchar('week_start', { length: 10 }).notNull(), // Monday, YYYY-MM-DD
  xp: integer('xp').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('consistency_bonuses_user_week_idx').on(table.userId, table.weekStart)
]);
