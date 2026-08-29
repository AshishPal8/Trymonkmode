import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, UserTokenPayload } from "../utils/jwt.js";
import { UnauthorizedError } from "../utils/errors.js";
import { db } from "../config/db.js";
import { users } from "../db/schema.js";
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
    let token: string | undefined = req.cookies?.access_token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      throw new UnauthorizedError(
        "Authentication required. No session cookie or bearer token provided.",
      );
    }

    const decoded = verifyAccessToken(token);
    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!userRecord) {
      throw new UnauthorizedError(
        "User account associated with this session no longer exists.",
      );
    }

    req.user = {
      userId: userRecord.id,
      email: userRecord.email,
      role: userRecord.role,
      planTier: (decoded as any).planTier || "free",
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
