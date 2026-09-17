import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

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
