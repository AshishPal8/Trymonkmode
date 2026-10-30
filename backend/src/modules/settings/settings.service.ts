import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { systemSettings } from "../../db/schema.js";
import type {
  SetSystemFlagInput,
  UpdateSystemFlagInput,
} from "./settings.schema.js";

const DEFAULT_FLAGS = [
  {
    key: "reminders_cron",
    value: "1",
    description:
      "Hourly lookahead batching & in-memory precision reminders for tasks, calendar events, and habits.",
    category: "cron",
  },
  {
    key: "cleanup_cron",
    value: "1",
    description:
      "Daily midnight database cleanup for expired OTPs, revoked tokens, and audit logs.",
    category: "cron",
  },
  {
    key: "maintenance_mode",
    value: "0",
    description:
      "Master maintenance switch for scheduled server/database maintenance.",
    category: "system",
  },
  {
    key: "email_service",
    value: "1",
    description:
      "Master switch for global email dispatches and weekly digest reports.",
    category: "system",
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
    console.warn("⚠️ [SystemSettings] Seeding check note:", err);
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

// Flags are read on almost every task/event write and by every cron run, so
// keep them in memory for a short while. Any write through this service
// clears the cache right away, so admin changes still apply instantly.
const FLAG_CACHE_TTL_MS = 60 * 1000;
const flagCache = new Map<string, { raw: string | null; expiresAt: number }>();

export function clearFlagCache() {
  flagCache.clear();
}

/**
 * Boolean check for a flag. Supports '1' / '0', 'true' / 'false', 'on' / 'off', 'yes' / 'no'.
 */
export async function isFlagEnabled(
  key: string,
  defaultValue = true,
): Promise<boolean> {
  let raw: string | null;
  const cached = flagCache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    raw = cached.raw;
  } else {
    try {
      const [row] = await db
        .select({ value: systemSettings.value })
        .from(systemSettings)
        .where(eq(systemSettings.key, key))
        .limit(1);
      raw = row ? String(row.value) : null;
      flagCache.set(key, { raw, expiresAt: Date.now() + FLAG_CACHE_TTL_MS });
    } catch {
      return defaultValue;
    }
  }

  if (raw === null) return defaultValue;
  const val = raw.trim().toLowerCase();
  return val === "1" || val === "true" || val === "yes" || val === "on";
}

/**
 * Updates an existing flag or creates it if it doesn't exist.
 */
export async function updateSystemFlagService(
  key: string,
  input: UpdateSystemFlagInput,
) {
  const existing = await getSystemFlagService(key);

  if (existing) {
    const updates: any = {
      value: input.value,
      updatedAt: new Date(),
    };
    if (input.description !== undefined)
      updates.description = input.description;
    if (input.category !== undefined) updates.category = input.category;

    const [updated] = await db
      .update(systemSettings)
      .set(updates)
      .where(eq(systemSettings.key, key))
      .returning();
    clearFlagCache();

    // reminders_cron needs no restart: the reminder worker reads the flag
    // (from the cache cleared above) on every run.

    return updated;
  }

  // Insert new flag
  const [created] = await db
    .insert(systemSettings)
    .values({
      key,
      value: input.value,
      description: input.description || "",
      category: input.category || "general",
    })
    .returning();
  clearFlagCache();

  return created;
}

/**
 * Creates a new flag.
 */
export async function createSystemFlagService(input: SetSystemFlagInput) {
  const [created] = await db
    .insert(systemSettings)
    .values({
      key: input.key.trim(),
      value: input.value.trim(),
      description: input.description || "",
      category: input.category || "general",
    })
    .returning();
  clearFlagCache();

  return created;
}

/**
 * Deletes a flag by key.
 */
export async function deleteSystemFlagService(key: string) {
  await db.delete(systemSettings).where(eq(systemSettings.key, key));
  clearFlagCache();
  return { message: `System flag '${key}' deleted successfully.` };
}
