import { z } from "zod";
import { RULE_KEYS } from "./achievement.rules.js";

export const achievementSchema = z.object({
  key: z.string().trim().regex(/^[a-z0-9_]{2,60}$/, "Use a–z, 0–9 and _"),
  title: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).default(""),
  emoji: z.string().trim().min(1).max(16).default("🏅"),
  rule: z.enum(RULE_KEYS),
  threshold: z.number().int().min(1).max(100_000),
  xpReward: z.number().int().min(0).max(5000).default(0),
  isActive: z.boolean().default(true),
  orderIndex: z.number().int().min(0).max(1000).default(0),
});

export const updateAchievementSchema = achievementSchema.partial();

export const markSeenSchema = z.object({
  achievementIds: z.array(z.number().int().positive()).min(1).max(100),
});

export type AchievementInput = z.infer<typeof achievementSchema>;
