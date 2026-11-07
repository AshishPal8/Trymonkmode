import type { NextFunction, Request, RequestHandler, Response } from "express";
import { BadRequestError } from "./errors.js";

type Handler = (req: Request, res: Response) => Promise<unknown>;

/** Lets a route handler be async: thrown errors go to the error middleware. */
export const asyncHandler =
  (fn: Handler) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };

/** A positive integer route param, e.g. `/goals/:id`. */
export function idParam(req: Request, name = "id"): number {
  const id = Number(req.params[name]);
  if (!Number.isInteger(id) || id <= 0) throw new BadRequestError("Invalid id.");
  return id;
}

/** The signed-in user's id (routes behind `authenticate`). */
export const currentUserId = (req: Request): number => req.user!.userId;

/**
 * Lets browsers and the CDN (Vercel) reuse a public response for a while,
 * so repeat visits don't reach the server. Only for data that is the same for everyone.
 */
export const publicCache =
  (browserSeconds: number, cdnSeconds: number): RequestHandler =>
  (_req, res, next) => {
    res.set(
      "Cache-Control",
      `public, max-age=${browserSeconds}, s-maxage=${cdnSeconds}, stale-while-revalidate=${cdnSeconds * 2}`,
    );
    next();
  };
