import { pgTable, serial, integer, varchar, text, date, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './user.schema.js';

// Admins create challenges; any user can join. A challenge runs for
// `durationDays` from `startDate`. Each day a member "completes" it by
// reaching `dailyTarget` of the metric, counted from data saved on the
// server (focus sessions, tasks, habits) or a manual check-in.
//
// metric: 'focus_minutes' | 'focus_sessions' | 'tasks_done' | 'habit_checkins' | 'manual'
export const challenges = pgTable('challenges', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 120 }).notNull(),
  description: text('description').notNull().default(''),
  emoji: varchar('emoji', { length: 16 }).notNull().default('🔥'),
  metric: varchar('metric', { length: 30 }).notNull(),
  dailyTarget: integer('daily_target').notNull(),
  durationDays: integer('duration_days').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(), // last day, inclusive
  timezone: varchar('timezone', { length: 100 }).notNull().default('Asia/Kolkata'),
  createdBy: integer('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('challenges_end_idx').on(table.endDate),
  index('challenges_created_by_idx').on(table.createdBy),
]);

export const challengeMembers = pgTable('challenge_members', {
  id: serial('id').primaryKey(),
  challengeId: integer('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('challenge_members_pair_idx').on(table.challengeId, table.userId),
  index('challenge_members_user_idx').on(table.userId),
]);

// Honor-based "I did it today" for manual challenges.
export const challengeCheckins = pgTable('challenge_checkins', {
  id: serial('id').primaryKey(),
  challengeId: integer('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  day: date('day').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('challenge_checkins_unique_idx').on(table.challengeId, table.userId, table.day),
]);
