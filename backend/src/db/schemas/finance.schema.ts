import {
  pgTable,
  serial,
  varchar,
  numeric,
  timestamp,
  integer,
  date,
  index
} from 'drizzle-orm/pg-core';
import { users } from './user.schema.js';

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  type: varchar('type', { length: 20 }).notNull().default('expense'), // 'income' | 'expense'
  category: varchar('category', { length: 50 }).notNull().default('General'),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull().default('Apple Pay'),
  date: date('date').notNull(),
  time: varchar('time', { length: 20 }).notNull().default('12:00 PM'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('transactions_user_id_idx').on(table.userId),
  index('transactions_date_idx').on(table.date)
]);