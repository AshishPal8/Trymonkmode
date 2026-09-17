import { z } from "zod";

export const setSystemFlagSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(255).default("1"),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional().default("general"),
});

export const updateSystemFlagSchema = z.object({
  key: z.string().min(1).max(100).optional(),
  value: z.string().max(255),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
});

export type SetSystemFlagInput = z.infer<typeof setSystemFlagSchema>;
export type UpdateSystemFlagInput = z.infer<typeof updateSystemFlagSchema>;
