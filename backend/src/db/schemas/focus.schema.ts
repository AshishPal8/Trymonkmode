import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './user.schema.js';

// One row per focus session, including ones stopped early.
export const focusSessions = pgTable('focus_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  durationMinutes: integer('duration_minutes').notNull(), // actual focused time (pauses excluded)
  plannedMinutes: integer('planned_minutes').notNull(),
  completed: boolean('completed').notNull().default(false), // true = ran the full planned time
  mode: varchar('mode', { length: 20 }).notNull().default('pomodoro'), // 'pomodoro' | 'stopwatch'
  tag: varchar('tag', { length: 100 }).notNull().default('Deep Work'),
  taskId: integer('task_id'),
  goalId: integer('goal_id'), // filled from the task's goal when a task is picked
  // Thoughts jotted down during the session ("distraction notes")
  notes: text('notes'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('focus_sessions_user_ended_idx').on(table.userId, table.endedAt)
]);
