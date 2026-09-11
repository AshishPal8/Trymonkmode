import { z } from 'zod';

export const createSystemFlagSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(255).default('1'),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional().default('general'),
});

export const updateSystemFlagSchema = z.object({
  value: z.string().max(255),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
});

export type CreateSystemFlagInput = z.infer<typeof createSystemFlagSchema>;
export type UpdateSystemFlagInput = z.infer<typeof updateSystemFlagSchema>;
