import type { Request } from "express";
import { rateLimit, ipKeyGenerator, type Options } from "express-rate-limit";
import { verifyAccessToken } from "../utils/jwt.js";

// Rate limits for every API route.
//
// Who is "one client":
//  - Signed in: the user id from their access token (so 50 students on one
//    college Wi-Fi don't share a single limit).
//  - Signed out: their IP. In production requests come through Vercel, which
//    sets X-Forwarded-For to the real visitor IP, so we use its first entry.
//
// Someone calling the Cloud Run URL directly could fake that first entry, so
// a separate flood guard uses the LAST entry, which Google's load balancer
// adds and nobody can fake.
//
// Counters live in memory per server instance: with N instances the real
// limit is up to N× these numbers. Move to a shared store (Redis) if we
// ever run many instances.

const MINUTE = 60 * 1000;

function forwardedFor(req: Request): string[] {
  const header = req.headers["x-forwarded-for"];
  const value = Array.isArray(header) ? header.join(",") : header ?? "";
  return value.split(",").map((ip) => ip.trim()).filter(Boolean);
}

/** The visitor's IP as reported by Vercel (or the direct connection). */
export function clientIp(req: Request): string {
  return ipKeyGenerator(forwardedFor(req)[0] || req.ip || "unknown");
}

/** The IP that actually reached our load balancer: can't be faked. */
function edgeIp(req: Request): string {
  return ipKeyGenerator(forwardedFor(req).at(-1) || req.ip || "unknown");
}

/** User id from a valid access token (cookie or Bearer), without a DB call. */
function tokenUserId(req: Request): number | null {
  if (req.user?.userId) return req.user.userId;
  const auth = req.headers.authorization;
  const candidates = [req.cookies?.access_token, auth?.startsWith("Bearer ") ? auth.slice(7) : undefined];
  for (const token of candidates) {
    if (typeof token !== "string" || token.length < 20) continue;
    try {
      return verifyAccessToken(token).userId;
    } catch {
      // expired or invalid: try the next one
    }
  }
  return null;
}

/** Signed-in user, else IP. */
function userOrIp(req: Request): string {
  const userId = tokenUserId(req);
  return userId ? `u:${userId}` : `ip:${clientIp(req)}`;
}

function limiter(name: string, opts: Partial<Options>) {
  return rateLimit({
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: (req) => `${name}:${userOrIp(req)}`,
    handler: (_req, res, _next, options) => {
      res.status(options.statusCode).json({
        success: false,
        message: "Too many requests. Please wait a bit and try again.",
        data: null,
      });
    },
    ...opts,
  });
}

// ─── Applied to all /api routes ──────────────────────────────────────────────

/** Flood guard per real connecting IP. High, because Vercel's IPs carry many users. */
export const edgeLimiter = limiter("edge", {
  windowMs: MINUTE,
  limit: 3000,
  keyGenerator: (req) => `edge:${edgeIp(req)}`,
});

/** Normal use: a dashboard load is ~15 calls, so 300/min is generous. */
export const apiLimiter = limiter("api", { windowMs: MINUTE, limit: 300 });

// ─── Specific routes ─────────────────────────────────────────────────────────

/** Public, signed-out reads (blog list and articles). */
export const publicReadLimiter = limiter("public", {
  windowMs: MINUTE,
  limit: 60,
  keyGenerator: (req) => `public:${clientIp(req)}`,
});

/** Endpoints that do a lot of work per call (analytics, leaderboards, streak). */
export const heavyLimiter = limiter("heavy", { windowMs: MINUTE, limit: 40 });

export const authLimiter = limiter("auth", { windowMs: 15 * MINUTE, limit: 40, keyGenerator: (req) => `auth:${clientIp(req)}` });

export const refreshLimiter = limiter("refresh", { windowMs: 15 * MINUTE, limit: 60, keyGenerator: (req) => `refresh:${clientIp(req)}` });

export const otpSendLimiter = limiter("otp-send", {
  windowMs: 15 * MINUTE,
  limit: 5,
  keyGenerator: (req) => `otp-send:${String(req.body?.email || "").toLowerCase()}`,
});

export const otpVerifyLimiter = limiter("otp-verify", {
  windowMs: 15 * MINUTE,
  limit: 8,
  keyGenerator: (req) => `otp-verify:${String(req.body?.email || "").toLowerCase()}`,
});

export const uploadLimiter = limiter("upload", { windowMs: 60 * MINUTE, limit: 30 });

export const sendLimiter = limiter("send", { windowMs: 60 * MINUTE, limit: 20 });

/** Friend requests, invites, groups, focus rooms. */
export const socialLimiter = limiter("social", { windowMs: 60 * MINUTE, limit: 40 });
