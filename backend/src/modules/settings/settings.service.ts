import { eq } from 'drizzle-orm';
import { db } from '../../config/db.js';
import { systemSettings } from '../../db/schema.js';
import type { CreateSystemFlagInput, UpdateSystemFlagInput } from './settings.schema.js';

const DEFAULT_FLAGS = [
  {
    key: 'reminders_cron',
    value: '1',
    description: 'Hourly lookahead batching & in-memory precision reminders for tasks, calendar events, and habits.',
    category: 'cron',
  },
  {
    key: 'cleanup_cron',
    value: '1',
    description: 'Daily midnight database cleanup for expired OTPs, revoked tokens, and audit logs.',
    category: 'cron',
  },
  {
    key: 'maintenance_mode',
    value: '0',
    description: 'Master maintenance switch for scheduled server/database maintenance.',
    category: 'system',
  },
  {
    key: 'email_service',
    value: '1',
    description: 'Master switch for global email dispatches and weekly digest reports.',
    category: 'system',
  },
];

/**
 * Ensures default essential system flags exist in the database.
 */
export async function seedDefaultSystemFlags() {
  try {
    for (const flag of DEFAULT_FLAGS) {
      const existing = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, flag.key))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(systemSettings).values(flag).onConflictDoNothing();
      }
    }
  } catch (err) {
    console.warn('⚠️ [SystemSettings] Seeding check note:', err);
  }
}

// Auto-check defaults on startup
seedDefaultSystemFlags().catch(() => {});

/**
 * Returns all dynamic system flags.
 */
export async function getAllSystemFlagsService() {
  await seedDefaultSystemFlags();
  return db.select().from(systemSettings).orderBy(systemSettings.id);
}

/**
 * Returns a single system flag by key.
 */
export async function getSystemFlagService(key: string) {
  const [row] = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.key, key))
    .limit(1);

  return row || null;
}

/**
 * Fast direct boolean check for any flag in the database.
 * Supports '1' / '0', 'true' / 'false', 'on' / 'off', 'yes' / 'no'.
 */
export async function isFlagEnabled(key: string, defaultValue = true): Promise<boolean> {
  try {
    const [row] = await db
      .select({ value: systemSettings.value })
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);

    if (!row) {
      return defaultValue;
    }

    const val = String(row.value).trim().toLowerCase();
    return val === '1' || val === 'true' || val === 'yes' || val === 'on';
  } catch {
    return defaultValue;
  }
}

/**
 * Updates an existing flag or creates it if it doesn't exist.
 */
export async function updateSystemFlagService(key: string, input: UpdateSystemFlagInput) {
  const existing = await getSystemFlagService(key);

  if (existing) {
    const updates: any = {
      value: input.value,
      updatedAt: new Date(),
    };
    if (input.description !== undefined) updates.description = input.description;
    if (input.category !== undefined) updates.category = input.category;

    const [updated] = await db
      .update(systemSettings)
      .set(updates)
      .where(eq(systemSettings.key, key))
      .returning();

    // Trigger cron lifecycle if this was a cron flag
    if (key === 'reminders_cron') {
      const isEnabled = input.value === '1' || input.value === 'true';
      const { loadUpcomingRemindersBatch, stopReminderCron, startReminderCron } = await import(
        '../cron/reminders.cron.js'
      );
      if (!isEnabled) {
        console.log('🛑 [SystemSettings] reminders_cron disabled. Purging in-memory timers.');
        stopReminderCron();
      } else {
        console.log('⚡ [SystemSettings] reminders_cron enabled. Re-scheduling lookahead batch.');
        startReminderCron();
        loadUpcomingRemindersBatch().catch(() => {});
      }
    }

    return updated;
  }

  // Insert new flag
  const [created] = await db
    .insert(systemSettings)
    .values({
      key,
      value: input.value,
      description: input.description || '',
      category: input.category || 'general',
    })
    .returning();

  return created;
}

/**
 * Creates a new flag.
 */
export async function createSystemFlagService(input: CreateSystemFlagInput) {
  const [created] = await db
    .insert(systemSettings)
    .values({
      key: input.key.trim(),
      value: input.value.trim(),
      description: input.description || '',
      category: input.category || 'general',
    })
    .returning();

  return created;
}

/**
 * Deletes a flag by key.
 */
export async function deleteSystemFlagService(key: string) {
  await db.delete(systemSettings).where(eq(systemSettings.key, key));
  return { message: `System flag '${key}' deleted successfully.` };
}
