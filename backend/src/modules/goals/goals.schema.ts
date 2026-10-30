import { z } from "zod";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const createGoalSchema = z.object({
  title: z.string().trim().min(1, "Goal title is required").max(255),
  description: z.string().max(2000).optional(),
  why: z.string().max(1000).optional(),
  category: z.string().max(50).default("Learning"),
  timeframe: z.string().max(50).default("quarterly"),
  kind: z.enum(["project", "target", "focus"]).default("project"),
  status: z.enum(["active", "paused", "done"]).default("active"),
  targetMetric: z.string().max(150).optional(),
  unit: z.string().max(30).optional(),
  currentProgress: z.number().int().min(0).default(0),
  targetProgress: z.number().int().min(1).default(100),
  targetFocusMinutes: z.number().int().min(1).max(100000).optional(),
  startDate: dateStr.optional().nullable(),
  deadline: dateStr.optional().nullable(),
  color: z.string().max(50).default("#0052FF"),
  icon: z.string().max(50).default("Target"),
  // Optional starting milestones, in order
  milestones: z
    .array(z.object({ title: z.string().trim().min(1).max(255), dueDate: dateStr.optional().nullable() }))
    .max(50)
    .optional(),
});

export const updateGoalSchema = createGoalSchema.omit({ milestones: true }).partial();

export const createMilestoneSchema = z.object({
  title: z.string().trim().min(1).max(255),
  dueDate: dateStr.optional().nullable(),
});

export const updateMilestoneSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  dueDate: dateStr.optional().nullable(),
  completed: z.boolean().optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
