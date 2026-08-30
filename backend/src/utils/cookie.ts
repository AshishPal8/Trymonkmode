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
 * Comprehensively clears authentication cookies across all browser engines (Chrome, Safari, Edge, Firefox)
 * Sends explicit raw Set-Cookie expiration headers for both partitioned and standard cross-site contexts.
 */
export function clearAuthCookies(res: Response): void {
  // Explicit raw HTTP Set-Cookie headers with Epoch expiration & Max-Age=0
  res.setHeader("Set-Cookie", [
    "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; Secure; SameSite=None; Partitioned",
    "refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; Secure; SameSite=None; Partitioned",
    "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; Secure; SameSite=None",
    "refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; Secure; SameSite=None",
    "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax",
    "refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax",
    "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0",
    "refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0",
  ]);
}
