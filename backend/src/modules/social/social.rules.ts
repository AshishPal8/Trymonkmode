// Pure rules for usernames, invite codes and friend pairs (no database).

import { randomBytes } from "node:crypto";

export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
export const MAX_FRIENDS = 200;
export const MAX_PENDING_SENT = 50;

const RESERVED_USERNAMES = new Set([
  "admin", "administrator", "support", "help", "root", "system", "staff",
  "trymonk", "trymonkmode", "monk", "monkmode", "official", "null", "undefined",
]);

/** "  Ashish_Pal " -> "ashish_pal". */
export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^@/, "").toLowerCase();
}

/** Null when fine, otherwise a message to show the user. */
export function usernameProblem(username: string): string | null {
  if (!USERNAME_PATTERN.test(username)) return "Use 3–20 letters, numbers or _.";
  if (RESERVED_USERNAMES.has(username)) return "That username is reserved.";
  return null;
}

/**
 * Starting point for an auto username: "Ashish Pal" -> "ashishpal",
 * falling back to the email name. Always 3–14 characters (room for a number).
 */
export function usernameBase(name: string, email: string): string {
  const slug = (text: string) =>
    text
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 14);
  const base = slug(name) || slug(email.split("@")[0]);
  return base.length >= 3 ? base : `monk${base}`;
}

/** "ashishpal" -> "ashishpal4821". */
export const withRandomSuffix = (base: string) => `${base}${Math.floor(1000 + Math.random() * 9000)}`;

// No 0/O/1/I/L, so codes are easy to read out loud.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateInviteCode(length = 8): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

/** A friendship row stores the pair as (smaller id, bigger id). */
export function orderedPair(a: number, b: number) {
  return a < b ? { userLowId: a, userHighId: b } : { userLowId: b, userHighId: a };
}

export const otherUserId = (row: { userLowId: number; userHighId: number }, me: number) =>
  row.userLowId === me ? row.userHighId : row.userLowId;
