import { eq, and, desc } from "drizzle-orm";
import { db } from "../../config/db.js";
import { notes } from "../../db/schema.js";
import { NotFoundError } from "../../utils/errors.js";
import type { CreateNoteInput, UpdateNoteInput } from "./notes.schema.js";

export async function getNotesService(userId: number) {
  return db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.isPinned), desc(notes.createdAt));
}

export async function createNoteService(
  userId: number,
  input: CreateNoteInput,
) {
  const [created] = await db
    .insert(notes)
    .values({
      userId,
      title: input.title,
      content: input.content,
      color: input.color || "#0052FF",
      isPinned: input.isPinned ?? false,
      tags: input.tags || [],
    })
    .returning();
  return created;
}

export async function updateNoteService(
  userId: number,
  noteId: number,
  input: UpdateNoteInput,
) {
  const [updated] = await db
    .update(notes)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning();

  if (!updated) {
    throw new NotFoundError("Note not found or unauthorized.");
  }

  return updated;
}

export async function deleteNoteService(userId: number, noteId: number) {
  const [deleted] = await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning();

  if (!deleted) {
    throw new NotFoundError("Note not found or unauthorized.");
  }

  return { message: "Note deleted successfully." };
}
