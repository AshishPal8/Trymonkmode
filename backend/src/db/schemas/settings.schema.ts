import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  index,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./user.schema.js";

export const systemSettings = pgTable(
  "system_settings",
  {
    id: serial("id").primaryKey(),
    key: varchar("key", { length: 100 }).notNull().unique(),
    value: varchar("value", { length: 255 }).notNull().default("1"), // '1' (active) | '0' (disabled) or custom string
    description: text("description").default(""),
    category: varchar("category", { length: 50 }).notNull().default("general"), // 'cron' | 'feature' | 'system'
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("system_settings_key_idx").on(table.key),
    index("system_settings_category_idx").on(table.category),
  ],
);

// Who changed what in the admin centre (role/plan changes, broadcasts, flags,
// blog and page edits). Written by the auditAdmin middleware.
export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: serial("id").primaryKey(),
    adminId: integer("admin_id").references(() => users.id, { onDelete: "set null" }),
    adminEmail: varchar("admin_email", { length: 255 }),
    action: varchar("action", { length: 100 }).notNull(), // e.g. "user.role_tier.update"
    targetId: varchar("target_id", { length: 100 }),
    details: jsonb("details").notNull().default({}),
    ip: varchar("ip", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("admin_audit_logs_created_idx").on(table.createdAt)],
);
