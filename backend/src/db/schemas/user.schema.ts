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

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull().default(''),
  avatar: text('avatar'),
  title: varchar('title', { length: 150 }).notNull().default(''),
  bio: text('bio').default(''),
  role: varchar('role', { length: 50 }).notNull().default('user'), // 'superadmin' | 'admin' | 'user'
  xp: integer('xp').notNull().default(0),
  level: integer('level').notNull().default(1),
  streak: integer('streak').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('users_email_idx').on(table.email),
  index('users_role_idx').on(table.role)
]);

export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  theme: varchar('theme', { length: 20 }).notNull().default('dark'), // 'dark' | 'light' | 'system'
  timezone: varchar('timezone', { length: 100 }).notNull().default('UTC'),
  notificationsEnabled: boolean('notifications_enabled').notNull().default(true),
  emailNotifications: boolean('email_notifications').notNull().default(true),
  soundEffects: boolean('sound_effects').notNull().default(true),
  focusDuration: integer('focus_duration').notNull().default(25),
  shortBreakDuration: integer('short_break_duration').notNull().default(5),
  longBreakDuration: integer('long_break_duration').notNull().default(15),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('user_settings_user_id_idx').on(table.userId)
]);

export const userPlans = pgTable('user_plans', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  planTier: varchar('plan_tier', { length: 50 }).notNull().default('free'), // 'free' | 'pro' | 'ai_ultra' | 'lifetime'
  planStatus: varchar('plan_status', { length: 50 }).notNull().default('active'), // 'active' | 'trialing' | 'canceled' | 'past_due'
  planExpiresAt: timestamp('plan_expires_at', { withTimezone: true }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('user_plans_user_id_idx').on(table.userId),
  index('user_plans_tier_idx').on(table.planTier)
]);

export const userFavorites = pgTable('user_favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  pageKey: varchar('page_key', { length: 50 }).notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  isPinned: boolean('is_pinned').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('user_favorites_user_id_idx').on(table.userId),
  index('user_favorites_page_key_idx').on(table.pageKey)
]);

export const otps = pgTable('otps', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  otpHash: varchar('otp_hash', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isUsed: boolean('is_used').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('otps_email_idx').on(table.email)
]);

export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  ipAddress: varchar('ip_address', { length: 100 }),
  userAgent: text('user_agent'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isRevoked: boolean('is_revoked').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('refresh_tokens_user_id_idx').on(table.userId),
  index('refresh_tokens_hash_idx').on(table.tokenHash)
]);