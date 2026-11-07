import { authApi } from "./api";
import { triggerCelebrationConfetti } from "./utils";
import { toast } from "@/components/ui/toast";

let signIn: Promise<void> | null = null;

/**
 * After Google sign-in the backend sends us back with a one-time `code`
 * (`/app?google_auth=success&code=…`). Swaps it for tokens with a POST
 * (tokens never sit in the URL) and cleans the address bar.
 *
 * Runs once per page load: React may run effects twice, and the second run
 * must wait for the same swap instead of checking the session too early.
 */
export function completeGoogleSignIn(): Promise<void> {
  signIn ??= run();
  return signIn;
}

async function run(): Promise<void> {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const googleAuth = params.get("google_auth");
  const code = params.get("code");
  const legacyToken = params.get("token");
  const legacyRefresh = params.get("refresh");
  if (!googleAuth && !code) return;

  // Keep any other params (e.g. ?module=tasks), drop the sign-in ones.
  for (const key of ["google_auth", "code", "token", "refresh"]) params.delete(key);
  const rest = params.toString();
  window.history.replaceState({}, document.title, window.location.pathname + (rest ? `?${rest}` : ""));

  if (googleAuth !== "success") return;

  if (code) {
    try {
      const res = await authApi.exchangeGoogleCode(code);
      const data = res?.data?.data;
      if (data?.accessToken) localStorage.setItem("trymonk_access_token", data.accessToken);
      if (data?.refreshToken) localStorage.setItem("trymonk_refresh_token", data.refreshToken);
      triggerCelebrationConfetti();
    } catch {
      toast.error("Sign-in link expired. Please sign in again.");
    }
  } else if (legacyToken) {
    // Older backend: tokens came in the URL.
    localStorage.setItem("trymonk_access_token", legacyToken);
    if (legacyRefresh && legacyRefresh.length > 20) localStorage.setItem("trymonk_refresh_token", legacyRefresh);
    triggerCelebrationConfetti();
  }
}
