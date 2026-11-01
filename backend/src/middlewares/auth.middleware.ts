import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, UserTokenPayload } from "../utils/jwt.js";
import { UnauthorizedError } from "../utils/errors.js";
import { db } from "../config/db.js";
import { users, userPlans } from "../db/schema.js";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      user?: UserTokenPayload & {
        name: string;
        avatar?: string | null;
        streak: number;
        level: number;
        xp: number;
      };
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;
    const bearer =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : undefined;
    // Cookie first, then Bearer. If one is stale and the other is fresh
    // (e.g. only one got updated after a refresh), the fresh one wins.
    const candidates = [req.cookies?.access_token, bearer].filter(
      (t, i, arr): t is string =>
        typeof t === "string" && t.length > 20 && arr.indexOf(t) === i,
    );

    if (candidates.length === 0) {
      throw new UnauthorizedError(
        "Authentication required. No session cookie or bearer token provided.",
      );
    }

    let decoded: ReturnType<typeof verifyAccessToken> | null = null;
    let lastError: unknown;
    for (const candidate of candidates) {
      try {
        decoded = verifyAccessToken(candidate);
        break;
      } catch (err) {
        lastError = err;
      }
    }
    if (!decoded) throw lastError;
    const [row] = await db
      .select({ user: users, planTier: userPlans.planTier })
      .from(users)
      .leftJoin(userPlans, eq(userPlans.userId, users.id))
      .where(eq(users.id, decoded.userId))
      .limit(1);
    const userRecord = row?.user;

    if (!userRecord) {
      throw new UnauthorizedError(
        "User account associated with this session no longer exists.",
      );
    }

    req.user = {
      userId: userRecord.id,
      email: userRecord.email,
      role: userRecord.role,
      planTier: row.planTier || "free",
      name: userRecord.name,
      avatar: userRecord.avatar || null,
      streak: userRecord.streak,
      level: userRecord.level,
      xp: userRecord.xp,
    };

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return next(
        new UnauthorizedError(
          "Session has expired. Please refresh your session.",
        ),
      );
    }
    if (error.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Invalid session token."));
    }
    next(error);
  }
}
