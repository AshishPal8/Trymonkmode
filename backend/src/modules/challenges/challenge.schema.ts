import { z } from "zod";
import { MAX_DURATION_DAYS, METRIC_KEYS } from "./challenge.rules.js";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const createChallengeSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).default(""),
  emoji: z.string().trim().min(1).max(16).default("🔥"),
  metric: z.enum(METRIC_KEYS),
  dailyTarget: z.number().int().min(1),
  durationDays: z.number().int().min(1).max(MAX_DURATION_DAYS),
  startDate: dateStr,
});

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
