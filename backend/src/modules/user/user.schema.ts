import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  avatar: z.string().url().optional(),
  title: z.string().max(150).optional(),
  bio: z.string().max(500).optional(),
  theme: z.enum(['dark', 'light', 'system']).optional(),
  favorites: z.array(z.string()).optional(),
  timezone: z.string().max(100).optional(),
  notificationsEnabled: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  soundEffects: z.boolean().optional(),
});

export const updateUserRoleTierSchema = z.object({
  role: z.enum(['superadmin', 'admin', 'user']).optional(),
  planTier: z.enum(['free', 'pro', 'ai_ultra', 'lifetime']).optional(),
  planStatus: z.enum(['active', 'trialing', 'canceled', 'past_due']).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateUserRoleTierInput = z.infer<typeof updateUserRoleTierSchema>;