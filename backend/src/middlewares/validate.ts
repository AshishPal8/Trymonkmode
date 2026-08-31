import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../utils/errors.js";

interface ValidationTargets {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidationTargets) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        const parsed = await schemas.query.parseAsync(req.query);
        try {
          Object.defineProperty(req, "query", {
            value: parsed,
            writable: true,
            configurable: true,
            enumerable: true,
          });
        } catch {
          Object.assign(req.query, parsed);
        }
      }
      if (schemas.params) {
        const parsed = await schemas.params.parseAsync(req.params);
        try {
          Object.defineProperty(req, "params", {
            value: parsed,
            writable: true,
            configurable: true,
            enumerable: true,
          });
        } catch {
          Object.assign(req.params, parsed);
        }
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return next(
          new ValidationError("Input validation failed", formattedErrors),
        );
      }
      next(error);
    }
  };
}
