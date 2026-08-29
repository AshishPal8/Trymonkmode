import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  date,
  index
} from 'drizzle-orm/pg-core';
import { users } from './user.schema.js';

export const calendarEvents = pgTable('calendar_events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  date: date('date').notNull(), // YYYY-MM-DD
  startTime: varchar('start_time', { length: 20 }).notNull(),
  endTime: varchar('end_time', { length: 20 }).notNull(),
  category: varchar('category', { length: 50 }).notNull().default('Deep Work'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('calendar_user_id_idx').on(table.userId),
  index('calendar_date_idx').on(table.date)
]);