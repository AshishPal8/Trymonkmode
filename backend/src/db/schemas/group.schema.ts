import { pgTable, serial, integer, varchar, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './user.schema.js';

// Accountability group: 2–10 friends with a shared weekly focus goal.
export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 60 }).notNull(),
  emoji: varchar('emoji', { length: 16 }).notNull().default('🛡️'),
  weeklyGoalMinutes: integer('weekly_goal_minutes').notNull().default(600), // all members together
  ownerId: integer('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// role: 'owner' | 'member'
export const groupMembers = pgTable('group_members', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('group_members_pair_idx').on(table.groupId, table.userId),
  index('group_members_user_idx').on(table.userId),
]);

// A shared timer: members who join all finish at `endsAt`.
export const focusRooms = pgTable('focus_rooms', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  hostId: integer('host_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  durationMinutes: integer('duration_minutes').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull().defaultNow(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull()
}, (table) => [
  index('focus_rooms_group_end_idx').on(table.groupId, table.endsAt),
]);

// Who is focusing right now (one row per user, overwritten on each start).
export const focusPresence = pgTable('focus_presence', {
  userId: integer('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  endsAt: timestamp('ends_at', { withTimezone: true }), // null = stopwatch (open ended)
  roomId: integer('room_id').references(() => focusRooms.id, { onDelete: 'set null' }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// "Nudge a friend": kept so the same pair can only nudge once every few hours.
export const friendNudges = pgTable('friend_nudges', {
  id: serial('id').primaryKey(),
  fromUserId: integer('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toUserId: integer('to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('friend_nudges_pair_idx').on(table.fromUserId, table.toUserId, table.createdAt),
]);
