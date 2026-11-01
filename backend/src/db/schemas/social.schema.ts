import { pgTable, serial, integer, varchar, timestamp, index, uniqueIndex, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './user.schema.js';

// One row per pair of users, whatever its state. The pair is stored as
// (smaller id, bigger id) so A→B and B→A can never both exist.
//  pending  -> requesterId asked, the other user hasn't answered
//  accepted -> friends
//  blocked  -> blockedBy blocked the other; no requests either way
export const friendships = pgTable('friendships', {
  id: serial('id').primaryKey(),
  userLowId: integer('user_low_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  userHighId: integer('user_high_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  requesterId: integer('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  blockedBy: integer('blocked_by').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('friendships_pair_idx').on(table.userLowId, table.userHighId),
  index('friendships_high_idx').on(table.userHighId),
  check('friendships_ordered_pair', sql`${table.userLowId} < ${table.userHighId}`),
]);
