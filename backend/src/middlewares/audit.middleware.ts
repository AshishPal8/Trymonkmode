import type { NextFunction, Request, Response } from "express";
import { db } from "../config/db.js";
import { adminAuditLogs } from "../db/schema.js";

// Keys whose values we don't copy into the log (long or sensitive).
const SKIP_KEYS = new Set(["content", "password", "token", "accessToken", "refreshToken"]);

function summarize(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
    if (SKIP_KEYS.has(k)) continue;
    out[k] = typeof v === "string" && v.length > 200 ? `${v.slice(0, 200)}…` : v;
  }
  return out;
}

/**
 * Records an admin action once the request has succeeded.
 * Usage: router.patch("/:id/role-tier", auditAdmin("user.role_tier.update"), handler)
 */
export function auditAdmin(action: string, targetParam = "id") {
  return (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", () => {
      if (res.statusCode >= 400) return;
      db.insert(adminAuditLogs)
        .values({
          adminId: req.user?.userId ?? null,
          adminEmail: req.user?.email ?? null,
          action,
          targetId: (req.params[targetParam] as string | undefined) ?? (req.params.key as string | undefined) ?? null,
          details: summarize(req.body),
          ip: ((req.headers["x-forwarded-for"] as string) || req.ip || "").split(",")[0].trim().slice(0, 100),
        })
        .catch((err) => console.error("❌ [Audit] Failed to write audit log:", err));
    });
    next();
  };
}
