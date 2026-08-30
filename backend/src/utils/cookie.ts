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

export const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  path: "/",
  maxAge: 0,
  expires: new Date(0),
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
 * Comprehensively clears authentication cookies
 */
export function clearAuthCookies(res: Response): void {
  // Set empty value with Epoch expiration
  res.cookie("access_token", "", CLEAR_COOKIE_OPTIONS);
  res.cookie("refresh_token", "", CLEAR_COOKIE_OPTIONS);
  res.clearCookie("access_token", CLEAR_COOKIE_OPTIONS);
  res.clearCookie("refresh_token", CLEAR_COOKIE_OPTIONS);

  // Fallback for loose path clearing
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
}
