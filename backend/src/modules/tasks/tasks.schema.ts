import { z } from 'zod';

// ==========================================
// Zod Validation DTO Schemas (Tasks Module)
// ==========================================

export const createTaskSchema = z.object({
  goalId: z.number().optional(),
  title: z.string().min(1, 'Task title is required').max(255),
  description: z.string().optional(),
  priority: z.enum(['P1', 'P2', 'P3', 'P4']).default('P2'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD'),
  dueTime: z.string().optional(),
  tags: z.array(z.string()).default([]),
  subtasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    completed: z.boolean().default(false),
  })).default([]),
  completed: z.boolean().default(false),
  quadrant: z.enum([
    'urgent-important',
    'notUrgent-important',
    'urgent-notImportant',
    'notUrgent-notImportant',
  ]).default('notUrgent-important'),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskQuerySchema = z.object({
  dueDate: z.string().optional(),
  priority: z.string().optional(),
  quadrant: z.string().optional(),
  completed: z.enum(['true', 'false']).optional().transform(v => v === 'true'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;