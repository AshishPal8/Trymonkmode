import { z } from 'zod';

// ==========================================
// Zod Validation DTO Schemas (Calendar Module)
// ==========================================

export const createCalendarEventSchema = z.object({
  title: z.string().min(1, 'Event title is required').max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  category: z.string().default('Deep Work'),
  description: z.string().optional(),
});

export const updateCalendarEventSchema = createCalendarEventSchema.partial();

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;
export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>;