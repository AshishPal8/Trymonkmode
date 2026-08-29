import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  index
} from 'drizzle-orm/pg-core';

export const appPages = pgTable('app_pages', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  path: varchar('path', { length: 100 }).notNull(),
  hub: varchar('hub', { length: 50 }).notNull().default('Productivity'),
  icon: varchar('icon', { length: 50 }).notNull().default('LayoutDashboard'),
  orderIndex: integer('order_index').notNull().default(0),
  isEnabled: boolean('is_enabled').notNull().default(true),
  minRole: varchar('min_role', { length: 50 }).notNull().default('user'),
  minTier: varchar('min_tier', { length: 50 }).notNull().default('free'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('app_pages_key_idx').on(table.key),
  index('app_pages_enabled_idx').on(table.isEnabled),
  index('app_pages_order_idx').on(table.orderIndex)
]);