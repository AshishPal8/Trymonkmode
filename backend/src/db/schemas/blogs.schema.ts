import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const blogs = pgTable(
  "blogs",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description").notNull().default(""),
    content: text("content").notNull().default(""),
    coverImage: text("cover_image").notNull().default(""),
    author: varchar("author", { length: 100 }).notNull().default("Monk Mode Team"),
    authorAvatar: text("author_avatar"),
    tags: jsonb("tags").notNull().default(["Productivity"]),
    readTimeMinutes: integer("read_time_minutes").notNull().default(5),
    isActive: boolean("is_active").notNull().default(true),
    isDeleted: boolean("is_deleted").notNull().default(false),
    viewCount: integer("view_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("blogs_slug_idx").on(table.slug),
    index("blogs_active_idx").on(table.isActive),
    index("blogs_deleted_idx").on(table.isDeleted),
    index("blogs_created_idx").on(table.createdAt),
  ],
);
