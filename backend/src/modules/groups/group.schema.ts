import { z } from "zod";
import { MAX_GROUP_MEMBERS, ROOM_LENGTHS } from "./group.rules.js";

export const createGroupSchema = z.object({
  name: z.string().trim().min(2).max(60),
  emoji: z.string().trim().min(1).max(16).default("🛡️"),
  weeklyGoalMinutes: z.number().int().min(30).max(10_000).default(600),
  memberIds: z.array(z.number().int().positive()).max(MAX_GROUP_MEMBERS - 1).default([]),
});

export const updateGroupSchema = createGroupSchema.omit({ memberIds: true }).partial();

export const addMembersSchema = z.object({
  userIds: z.array(z.number().int().positive()).min(1).max(MAX_GROUP_MEMBERS - 1),
});

export const startRoomSchema = z.object({
  durationMinutes: z.number().int().refine((n) => (ROOM_LENGTHS as readonly number[]).includes(n), "Pick 25, 50 or 90 minutes"),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
