import type { PublicUser } from "@/lib/types";

/** Full link a friend can open, e.g. https://trymonkmode.in/?invite=AB12CD34 */
export function inviteLink(code: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://trymonkmode.in";
  return `${origin}/?invite=${code}`;
}

export function displayName(user: PublicUser): string {
  return user.name || (user.username ? `@${user.username}` : "Monk");
}

export const handle = (user: PublicUser) => (user.username ? `@${user.username}` : null);

/** Copies text; falls back to a toast-friendly false when the browser refuses. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
