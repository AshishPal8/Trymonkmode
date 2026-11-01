import { z } from "zod";

export const updateSocialProfileSchema = z.object({
  statsVisibility: z.enum(["public", "private"]),
});

export const friendRequestSchema = z.object({
  username: z.string().trim().min(1).max(30),
});

export const joinInviteSchema = z.object({
  code: z.string().trim().min(4).max(12),
});

export type UpdateSocialProfileInput = z.infer<typeof updateSocialProfileSchema>;

export const LEADERBOARD_SORTS = ["xp", "streak", "focus"] as const;
export type LeaderboardSort = (typeof LEADERBOARD_SORTS)[number];

export const leaderboardQuerySchema = z.object({
  sort: z.enum(LEADERBOARD_SORTS).default("xp"),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(5).max(50).default(20),
});
