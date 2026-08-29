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

export const bookmarks = pgTable('bookmarks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  url: text('url').notNull(),
  category: varchar('category', { length: 50 }).notNull().default('GitHub'),
  description: text('description'),
  tags: jsonb('tags').notNull().default([]),
  isPinned: boolean('is_pinned').notNull().default(false),
  isCompleted: boolean('is_completed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('bookmarks_user_id_idx').on(table.userId)
]);