import type { Request } from "express";
import { rateLimit, ipKeyGenerator, type Options } from "express-rate-limit";

function clientIp(req: Request): string {
  const forwarded = (req.headers["x-forwarded-for"] as string | undefined)
    ?.split(",")[0]
    ?.trim();
  return ipKeyGenerator(forwarded || req.ip || "unknown");
}

function userOrIp(req: Request): string {
  return req.user?.userId ? `u:${req.user.userId}` : `ip:${clientIp(req)}`;
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

export const apiLimiter = limiter("api", { windowMs: 60 * 1000, limit: 600 });

export const authLimiter = limiter("auth", {
  windowMs: 15 * 60 * 1000,
  limit: 40,
});

export const refreshLimiter = limiter("refresh", {
  windowMs: 15 * 60 * 1000,
  limit: 60,
});

export const otpSendLimiter = limiter("otp-send", {
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) =>
    `otp-send:${String(req.body?.email || "").toLowerCase()}`,
});

export const otpVerifyLimiter = limiter("otp-verify", {
  windowMs: 15 * 60 * 1000,
  limit: 8,
  keyGenerator: (req) =>
    `otp-verify:${String(req.body?.email || "").toLowerCase()}`,
});

export const uploadLimiter = limiter("upload", {
  windowMs: 60 * 60 * 1000,
  limit: 30,
});

export const sendLimiter = limiter("send", {
  windowMs: 60 * 60 * 1000,
  limit: 20,
});
