import { z } from 'zod';

export const createFocusSessionSchema = z.object({
  durationMinutes: z.number().int().min(1).max(600),
  plannedMinutes: z.number().int().min(1).max(600),
  completed: z.boolean().default(false),
  mode: z.enum(['pomodoro', 'stopwatch']).default('pomodoro'),
  tag: z.string().trim().min(1).max(100).default('Deep Work'),
  taskId: z.number().int().positive().optional(),
  notes: z.string().max(2000).optional(),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date(),
});

export const listFocusSessionsSchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional(),
});

export type CreateFocusSessionInput = z.infer<typeof createFocusSessionSchema>;
