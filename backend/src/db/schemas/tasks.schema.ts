import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  date,
  index
} from 'drizzle-orm/pg-core';
import { users } from './user.schema.js';

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  goalId: integer('goal_id'),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  priority: varchar('priority', { length: 10 }).notNull().default('P2'), // 'P1' | 'P2' | 'P3' | 'P4'
  dueDate: date('due_date').notNull(), // YYYY-MM-DD
  dueTime: varchar('due_time', { length: 50 }),
  tags: jsonb('tags').notNull().default([]),
  subtasks: jsonb('subtasks').notNull().default([]),
  completed: boolean('completed').notNull().default(false),
  quadrant: varchar('quadrant', { length: 50 }).notNull().default('notUrgent-important'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('tasks_user_id_idx').on(table.userId),
  index('tasks_due_date_idx').on(table.dueDate)
]);