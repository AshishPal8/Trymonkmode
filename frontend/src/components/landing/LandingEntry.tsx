"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "@/components/ui/toast";
import { captureInviteFromUrl } from "@/lib/pendingInvite";
import { LandingPage } from "./LandingPage";

/** React may run effects twice in development: show the sign-in error once. */
let errorShown = false;

/** Links that belong to the app (old notification and sign-in links pointed at "/"). */
const APP_PARAMS = ["module", "notifAction", "google_auth", "code", "token"];

/**
 * The home page. Handles links that arrive here:
 *  - old app links (/?module=tasks, /?google_auth=…) are forwarded to /app
 *  - ?invite=CODE is kept for after sign-up and opens the sign-up form
 *  - ?login=1 (sent from /app when signed out) opens the login form
 */
export function LandingEntry() {
  const router = useRouter();
  const params = useSearchParams();

  const isAppLink = APP_PARAMS.some((key) => params.has(key));
  const hasError = params.has("error");
  // Decided once from the first URL: cleaning the URL below must not close the form.
  const [authMode] = useState<"login" | "signup" | null>(() =>
    params.has("invite") ? "signup" : params.has("login") || hasError ? "login" : null,
  );

  useEffect(() => {
    if (isAppLink) {
      router.replace(`/app${window.location.search}`);
      return;
    }
    captureInviteFromUrl(); // also removes ?invite from the address bar
    if (hasError && !errorShown) {
      errorShown = true;
      toast.error("Google sign-in didn't go through. Please try again.");
    }
    if (params.has("login") || hasError) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isAppLink, hasError, params, router]);

  if (isAppLink) return null;

  return (
    <>
      <LandingPage initialAuthMode={authMode} />
      <ToastContainer />
    </>
  );
}
