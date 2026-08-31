import { z } from "zod";

export const createBlogSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  description: z.string().default(""),
  content: z.string().min(1, "Content is required"),
  coverImage: z.string().default(""),
  author: z.string().default("Monk Mode Team"),
  authorAvatar: z.string().optional(),
  tags: z.array(z.string()).default(["Productivity"]),
  readTimeMinutes: z.number().int().positive().default(5),
  isActive: z.boolean().default(true),
});

export const updateBlogSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  content: z.string().min(1).optional(),
  coverImage: z.string().optional(),
  author: z.string().optional(),
  authorAvatar: z.string().optional(),
  tags: z.array(z.string()).optional(),
  readTimeMinutes: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});

export const queryBlogSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  tag: z.string().optional(),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type QueryBlogInput = z.infer<typeof queryBlogSchema>;
