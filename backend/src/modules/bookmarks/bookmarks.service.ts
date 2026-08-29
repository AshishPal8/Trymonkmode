import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../config/db.js';
import { bookmarks } from '../../db/schema.js';
import { NotFoundError } from '../../utils/errors.js';
import type { CreateBookmarkInput, UpdateBookmarkInput } from './bookmarks.schema.js';

export async function getBookmarksService(userId: number, category?: string) {
  const conditions = [eq(bookmarks.userId, userId)];
  if (category && category !== 'All') {
    conditions.push(eq(bookmarks.category, category));
  }
  return db
    .select()
    .from(bookmarks)
    .where(and(...conditions))
    .orderBy(desc(bookmarks.isPinned), desc(bookmarks.createdAt));
}

export async function createBookmarkService(userId: number, input: CreateBookmarkInput) {
  const [created] = await db
    .insert(bookmarks)
    .values({
      userId,
      title: input.title,
      url: input.url,
      category: input.category,
      description: input.description,
      tags: input.tags,
      isPinned: input.isPinned,
      isCompleted: input.isCompleted,
    })
    .returning();

  return created;
}

export async function updateBookmarkService(userId: number, bookmarkId: number, input: UpdateBookmarkInput) {
  const [updated] = await db
    .update(bookmarks)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
    .returning();

  if (!updated) {
    throw new NotFoundError('Bookmark not found.');
  }

  return updated;
}

export async function toggleBookmarkPinService(userId: number, bookmarkId: number) {
  const [existing] = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
    .limit(1);

  if (!existing) {
    throw new NotFoundError('Bookmark not found.');
  }

  const [updated] = await db
    .update(bookmarks)
    .set({
      isPinned: !existing.isPinned,
      updatedAt: new Date(),
    })
    .where(eq(bookmarks.id, bookmarkId))
    .returning();

  return updated;
}

export async function deleteBookmarkService(userId: number, bookmarkId: number) {
  const [deleted] = await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
    .returning();

  if (!deleted) {
    throw new NotFoundError('Bookmark not found.');
  }

  return { message: 'Bookmark removed successfully.' };
}