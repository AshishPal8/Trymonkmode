import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  date,
  timestamp,
  index
} from 'drizzle-orm/pg-core';
import { users } from './user.schema.js';

// A goal is also a project: it can have milestones, and tasks / focus
// sessions can be linked to it.
export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  why: text('why'), // the reason behind it, shown as motivation
  category: varchar('category', { length: 50 }).notNull().default('Learning'),
  timeframe: varchar('timeframe', { length: 50 }).notNull().default('quarterly'),
  // How progress is measured:
  //  'project' -> milestones / linked tasks done
  //  'target'  -> currentProgress / targetProgress (e.g. 12 / 24 books)
  //  'focus'   -> focus minutes on linked sessions / targetFocusMinutes
  kind: varchar('kind', { length: 20 }).notNull().default('project'),
  status: varchar('status', { length: 20 }).notNull().default('active'), // 'active' | 'paused' | 'done'
  targetMetric: varchar('target_metric', { length: 150 }),
  unit: varchar('unit', { length: 30 }), // for 'target', e.g. "books", "km"
  currentProgress: integer('current_progress').notNull().default(0),
  targetProgress: integer('target_progress').notNull().default(100),
  targetFocusMinutes: integer('target_focus_minutes'),
  startDate: date('start_date'),
  deadline: date('deadline'),
  color: varchar('color', { length: 50 }).notNull().default('#0052FF'),
  icon: varchar('icon', { length: 50 }).notNull().default('Target'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('goals_user_id_idx').on(table.userId)
]);

export const goalMilestones = pgTable('goal_milestones', {
  id: serial('id').primaryKey(),
  goalId: integer('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  dueDate: date('due_date'),
  completed: boolean('completed').notNull().default(false),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('goal_milestones_goal_idx').on(table.goalId),
  index('goal_milestones_user_idx').on(table.userId)
]);
