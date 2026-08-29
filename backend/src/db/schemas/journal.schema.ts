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

export const journalEntries = pgTable('journal_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(), // YYYY-MM-DD
  mood: varchar('mood', { length: 50 }).notNull().default('happy'),
  rating: integer('rating').notNull().default(5),
  howWasYourDay: text('how_was_your_day').notNull(),
  highlights: text('highlights'),
  gratitude: jsonb('gratitude').notNull().default([]),
  proudestAchievement: text('proudest_achievement'),
  tomorrowPriority: text('tomorrow_priority'),
  stickers: jsonb('stickers').notNull().default(['star']),
  affirmation: text('affirmation'),
  dailyPrompt: text('daily_prompt'),
  dailyPromptAnswer: text('daily_prompt_answer'),
  isLocked: boolean('is_locked').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('journal_user_id_idx').on(table.userId),
  index('journal_date_idx').on(table.date)
]);

export const dailyPrompts = pgTable('daily_prompts', {
  id: serial('id').primaryKey(),
  prompt: text('prompt').notNull(),
  category: varchar('category', { length: 100 }).notNull().default('Stoic Growth'),
  tags: jsonb('tags').notNull().default([]),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});