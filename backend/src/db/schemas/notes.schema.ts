import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index
} from 'drizzle-orm/pg-core';
import { users } from './user.schema.js';

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  color: varchar('color', { length: 50 }).notNull().default('#0052FF'),
  isPinned: boolean('is_pinned').notNull().default(false),
  tags: jsonb('tags').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('notes_user_id_idx').on(table.userId),
  index('notes_created_at_idx').on(table.createdAt)
]);