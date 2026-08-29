import { z } from "zod";

export const createHabitSchema = z.object({
  title: z.string().min(1, "Habit title is required").max(255),
  category: z.string().default("Productivity"),
  frequency: z.string().default("daily"),
  targetDays: z.array(z.number().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6]),
});

export const updateHabitSchema = createHabitSchema.partial();

export const checkInHabitSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
