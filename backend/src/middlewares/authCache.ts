// Who a signed-in user is (role, plan, name), cached for a few seconds so the
// auth check doesn't hit the database on every single request.
//
// Role and plan still come from the database (never from the token), so a
// change applies within CACHE_MS everywhere, and instantly on the server that
// made it (it calls `forgetAuthUser`).

const CACHE_MS = 15_000;
const MAX_ENTRIES = 10_000;

export interface AuthUser {
  userId: number;
  email: string;
  role: string;
  planTier: string;
  name: string;
}

const cache = new Map<number, { user: AuthUser; until: number }>();

export function getCachedAuthUser(userId: number): AuthUser | null {
  const hit = cache.get(userId);
  if (!hit) return null;
  if (hit.until < Date.now()) {
    cache.delete(userId);
    return null;
  }
  return hit.user;
}

export function cacheAuthUser(user: AuthUser): void {
  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value!); // drop the oldest
  cache.set(user.userId, { user, until: Date.now() + CACHE_MS });
}

/** Call after changing a user's role, plan or name. */
export function forgetAuthUser(userId: number): void {
  cache.delete(userId);
}
