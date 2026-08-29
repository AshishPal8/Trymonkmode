import { z } from 'zod';

// ==========================================
// Zod Validation DTO Schemas (Bookmarks Module)
// ==========================================

export const createBookmarkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  url: z.string().url('Must be a valid URL'),
  category: z.string().default('GitHub'),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isPinned: z.boolean().default(false),
  isCompleted: z.boolean().default(false),
});

export const updateBookmarkSchema = createBookmarkSchema.partial();

export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
export type UpdateBookmarkInput = z.infer<typeof updateBookmarkSchema>;