import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../config/db.js";
import { users, userSettings } from "../../db/schema.js";
import { BadRequestError, NotFoundError } from "../../utils/errors.js";
import { generateInviteCode, usernameBase, usernameProblem, withRandomSuffix } from "./social.rules.js";
import type { UpdateSocialProfileInput } from "./social.schema.js";

/** Columns that are safe to show to other users. */
export const publicUserColumns = {
  id: users.id,
  name: users.name,
  username: users.username,
  avatar: users.avatar,
};

export type PublicUser = { id: number; name: string; username: string | null; avatar: string | null };

// ─── Username (made once at sign-up, never changed) ──────────────────────────

async function isUsernameTaken(username: string) {
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
  return !!row;
}

/** A free username based on the user's name: "ashishpal", else "ashishpal4821". */
export async function generateUniqueUsername(name: string, email: string): Promise<string> {
  const base = usernameBase(name, email);
  if (!usernameProblem(base) && !(await isUsernameTaken(base))) return base;
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = withRandomSuffix(base);
    if (!(await isUsernameTaken(candidate))) return candidate;
  }
  return withRandomSuffix(`monk${Date.now().toString().slice(-6)}`);
}

/** Gives a username to a user who doesn't have one yet (accounts from before usernames). */
export async function ensureUsername(userId: number): Promise<string> {
  const [user] = await db
    .select({ username: users.username, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) throw new NotFoundError("User not found.");
  if (user.username) return user.username;

  const username = await generateUniqueUsername(user.name, user.email);
  await db.update(users).set({ username }).where(and(eq(users.id, userId), isNull(users.username)));
  return username;
}

/** Once per server start: usernames for all accounts that still have none. */
export async function backfillUsernames(): Promise<void> {
  const missing = await db.select({ id: users.id }).from(users).where(isNull(users.username));
  for (const { id } of missing) {
    await ensureUsername(id).catch((err) => console.error(`Username backfill failed for user ${id}:`, err));
  }
  if (missing.length) console.log(`👤 Gave usernames to ${missing.length} existing users.`);
}

// ─── Invite code ─────────────────────────────────────────────────────────────

/** Saves a fresh unique invite code (retries on the rare clash). */
async function saveNewInviteCode(userId: number): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateInviteCode();
    try {
      await db.update(users).set({ inviteCode: code }).where(eq(users.id, userId));
      return code;
    } catch {
      // unique clash: try another code
    }
  }
  throw new Error("Couldn't create an invite code.");
}

export async function resetInviteCodeService(userId: number) {
  return { inviteCode: await saveNewInviteCode(userId) };
}

/** Who sent this invite link (shown before joining). */
export async function getInvitePreviewService(userId: number, code: string) {
  const [inviter] = await db
    .select(publicUserColumns)
    .from(users)
    .where(eq(users.inviteCode, code.toUpperCase()))
    .limit(1);
  if (!inviter) throw new NotFoundError("This invite link doesn't work anymore.");
  if (inviter.id === userId) throw new BadRequestError("That's your own invite link.");
  return inviter;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function getSocialProfileService(userId: number) {
  const [row] = await db
    .select({
      username: users.username,
      inviteCode: users.inviteCode,
      statsVisibility: userSettings.statsVisibility,
    })
    .from(users)
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) throw new NotFoundError("User not found.");

  return {
    username: row.username ?? (await ensureUsername(userId)),
    inviteCode: row.inviteCode ?? (await saveNewInviteCode(userId)),
    statsVisibility: row.statsVisibility ?? "public",
  };
}

export async function updateSocialProfileService(userId: number, input: UpdateSocialProfileInput) {
  await db
    .insert(userSettings)
    .values({ userId, statsVisibility: input.statsVisibility })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: { statsVisibility: input.statsVisibility, updatedAt: new Date() },
    });
  return getSocialProfileService(userId);
}
