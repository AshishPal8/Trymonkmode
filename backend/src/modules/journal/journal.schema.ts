import { z } from 'zod';

// ==========================================
// Zod Validation DTO Schemas (Journal Module)
// ==========================================

export const createJournalSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  mood: z.string().default('happy'),
  rating: z.number().int().min(1).max(5).default(5),
  howWasYourDay: z.string().min(1, 'Journal reflection cannot be empty'),
  highlights: z.string().optional(),
  gratitude: z.array(z.string()).default([]),
  proudestAchievement: z.string().optional(),
  tomorrowPriority: z.string().optional(),
  stickers: z.array(z.string()).default(['star']),
  affirmation: z.string().optional(),
  dailyPrompt: z.string().optional(),
  dailyPromptAnswer: z.string().optional(),
  isLocked: z.boolean().default(false),
});

export const updateJournalSchema = createJournalSchema.partial();

export const dailyPromptQuerySchema = z.object({
  category: z.string().optional(),
  shuffle: z.enum(['true', 'false']).optional().transform(v => v === 'true'),
});

export type CreateJournalInput = z.infer<typeof createJournalSchema>;
export type UpdateJournalInput = z.infer<typeof updateJournalSchema>;