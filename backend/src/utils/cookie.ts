import { Response } from "express";
import { env } from "../config/env.js";

const isProd =
  env.NODE_ENV === "production" ||
  (typeof env.FRONTEND_URL === "string" &&
    env.FRONTEND_URL.startsWith("https://"));

export const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  maxAge: 60 * 60 * 1000, // 1 hour
  path: "/",
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: "/",
};

/**
 * Sets authentication access and refresh cookies
 */
export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  res.cookie("access_token", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refresh_token", refreshToken, REFRESH_COOKIE_OPTIONS);
}

/**
 * Comprehensively clears authentication cookies across all browser engines
 */
export function clearAuthCookies(res: Response): void {
  // 1. Explicit SameSite=None; Secure header (For Production & Cross-Site Cloud Run)
  res.cookie("access_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  res.cookie("refresh_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  // 2. Explicit SameSite=Lax header (For Localhost & Standard Dev)
  res.cookie("access_token", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  res.cookie("refresh_token", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  // 3. Fallback generic clear
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
}
