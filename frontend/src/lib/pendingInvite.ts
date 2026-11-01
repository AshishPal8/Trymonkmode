// An invite code from a link (?invite=CODE) is kept until the user is signed
// in, so it still works when they have to sign up first.

const KEY = "trymonk_pending_invite";
const CODE_PATTERN = /^[A-Za-z0-9]{4,12}$/;

/** Saves `?invite=` from the current URL (if any) and removes it from the address bar. */
export function captureInviteFromUrl(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const code = url.searchParams.get("invite");
  if (!code) return;

  if (CODE_PATTERN.test(code)) {
    try {
      localStorage.setItem(KEY, code.toUpperCase());
    } catch {
      // storage blocked: the invite just won't be remembered
    }
  }
  url.searchParams.delete("invite");
  window.history.replaceState({}, document.title, url.pathname + url.search);
}

export function getPendingInvite(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearPendingInvite(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
