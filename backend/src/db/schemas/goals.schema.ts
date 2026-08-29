import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  index
} from 'drizzle-orm/pg-core';
import { users } from './user.schema.js';

export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull().default('Engineering'),
  timeframe: varchar('timeframe', { length: 50 }).notNull().default('quarterly'),
  targetMetric: varchar('target_metric', { length: 150 }),
  currentProgress: integer('current_progress').notNull().default(0),
  targetProgress: integer('target_progress').notNull().default(100),
  color: varchar('color', { length: 50 }).notNull().default('#0052FF'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('goals_user_id_idx').on(table.userId)
]);