import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1, "Note title is required").max(255),
  content: z.string().min(1, "Note content cannot be empty"),
  color: z.string().default("#0052FF"),
  isPinned: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export const updateNoteSchema = createNoteSchema.partial();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
