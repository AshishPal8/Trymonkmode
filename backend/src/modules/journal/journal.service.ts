import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../config/db.js';
import { journalEntries, dailyPrompts, users } from '../../db/schema.js';
import { NotFoundError } from '../../utils/errors.js';
import type { CreateJournalInput } from './journal.schema.js';

// 1. Get all journal entries for user
export async function getEntriesService(userId: number) {
  return db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.date));
}

// 2. Get entry by specific date
export async function getEntryByDateService(userId: number, dateStr: string) {
  const [entry] = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, userId), eq(journalEntries.date, dateStr)))
    .limit(1);

  return entry || null;
}

// 3. Upsert journal entry (Create or Update) + Award +40 XP
export async function upsertEntryService(userId: number, input: CreateJournalInput) {
  const existing = await getEntryByDateService(userId, input.date);

  if (existing) {
    const [updated] = await db
      .update(journalEntries)
      .set({
        mood: input.mood,
        rating: input.rating,
        howWasYourDay: input.howWasYourDay,
        highlights: input.highlights,
        gratitude: input.gratitude,
        proudestAchievement: input.proudestAchievement,
        tomorrowPriority: input.tomorrowPriority,
        stickers: input.stickers,
        affirmation: input.affirmation,
        dailyPrompt: input.dailyPrompt,
        dailyPromptAnswer: input.dailyPromptAnswer,
        isLocked: input.isLocked,
        updatedAt: new Date(),
      })
      .where(eq(journalEntries.id, existing.id))
      .returning();

    return { entry: updated, isNew: false, xpGained: 10 };
  }

  const [created] = await db
    .insert(journalEntries)
    .values({
      userId,
      date: input.date,
      mood: input.mood,
      rating: input.rating,
      howWasYourDay: input.howWasYourDay,
      highlights: input.highlights,
      gratitude: input.gratitude,
      proudestAchievement: input.proudestAchievement,
      tomorrowPriority: input.tomorrowPriority,
      stickers: input.stickers,
      affirmation: input.affirmation,
      dailyPrompt: input.dailyPrompt,
      dailyPromptAnswer: input.dailyPromptAnswer,
      isLocked: input.isLocked,
    })
    .returning();

  // Award +40 XP to user
  await db
    .update(users)
    .set({ xp: sql`${users.xp} + 40` })
    .where(eq(users.id, userId));

  return { entry: created, isNew: true, xpGained: 40 };
}

// 4. Delete entry
export async function deleteEntryService(userId: number, entryId: number) {
  const [deleted] = await db
    .delete(journalEntries)
    .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
    .returning();

  if (!deleted) {
    throw new NotFoundError('Journal entry not found or already removed.');
  }

  return { message: 'Journal entry deleted successfully.' };
}

// 5. Get Daily Prompt from 1000+ Curated Bank (Zero LLM Token Cost!)
export async function getDailyPromptService(category?: string, shuffle?: boolean) {
  if (shuffle) {
    const [randomPrompt] = await db
      .select()
      .from(dailyPrompts)
      .where(eq(dailyPrompts.isActive, true))
      .orderBy(sql`RANDOM()`)
      .limit(1);

    return randomPrompt || { prompt: 'What is one hard truth you embraced today that made you wiser?', category: 'Stoic Growth' };
  }

  // Default: Deterministic Daily Prompt by day of year (all users receive matching prompt of the day)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const allPrompts = await db
    .select()
    .from(dailyPrompts)
    .where(eq(dailyPrompts.isActive, true));

  if (allPrompts.length === 0) {
    return { prompt: 'What is one hard truth you embraced today that made you wiser?', category: 'Stoic Growth' };
  }

  const index = dayOfYear % allPrompts.length;
  return allPrompts[index];
}