import { z } from 'zod';

// ==========================================
// Zod Validation DTO Schemas (Goals Module)
// ==========================================

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Goal title is required').max(255),
  description: z.string().optional(),
  category: z.string().default('Engineering'),
  timeframe: z.string().default('quarterly'),
  targetMetric: z.string().optional(),
  currentProgress: z.number().int().min(0).default(0),
  targetProgress: z.number().int().min(1).default(100),
  color: z.string().default('#0052FF'),
});

export const updateGoalSchema = createGoalSchema.partial();

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;