import { pgTable, serial, integer, varchar, text, boolean, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './user.schema.js';

// Badge catalog, managed by admins. A badge unlocks when the user's number
// for `rule` reaches `threshold` (see achievement.rules.ts for the rules).
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 60 }).notNull().unique(), // stable slug, e.g. 'streak_7'
  title: varchar('title', { length: 80 }).notNull(),
  description: text('description').notNull().default(''),
  emoji: varchar('emoji', { length: 16 }).notNull().default('🏅'),
  rule: varchar('rule', { length: 40 }).notNull(),
  threshold: integer('threshold').notNull(),
  xpReward: integer('xp_reward').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// One row per badge a user has. `seenAt` is set once the app has celebrated it.
export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: integer('achievement_id').notNull().references(() => achievements.id, { onDelete: 'cascade' }),
  unlockedAt: timestamp('unlocked_at', { withTimezone: true }).notNull().defaultNow(),
  seenAt: timestamp('seen_at', { withTimezone: true })
}, (table) => [
  uniqueIndex('user_achievements_pair_idx').on(table.userId, table.achievementId),
  index('user_achievements_unseen_idx').on(table.userId, table.seenAt),
]);
