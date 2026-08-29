import { z } from 'zod';

// ==========================================
// Zod Validation DTO Schemas (Pages Master Module)
// ==========================================

export const createAppPageSchema = z.object({
  key: z.string().min(1).max(50).toLowerCase().trim(),
  name: z.string().min(1).max(100).trim(),
  path: z.string().min(1).max(100).trim(),
  hub: z.string().min(1).max(50).default('Productivity'),
  icon: z.string().min(1).max(50).default('LayoutDashboard'),
  orderIndex: z.number().int().default(0),
  isEnabled: z.boolean().default(true),
  minRole: z.enum(['user', 'admin', 'superadmin']).default('user'),
  minTier: z.enum(['free', 'pro', 'ai_ultra', 'lifetime']).default('free'),
  description: z.string().optional(),
});

export const updateAppPageSchema = createAppPageSchema.partial();

export type CreateAppPageInput = z.infer<typeof createAppPageSchema>;
export type UpdateAppPageInput = z.infer<typeof updateAppPageSchema>;