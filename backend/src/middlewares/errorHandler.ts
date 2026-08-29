import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { HttpStatus } from '../utils/httpStatus.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let errors: unknown[] | undefined = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.code === '23505') {
    // PostgreSQL Unique Constraint Violation
    statusCode = HttpStatus.CONFLICT;
    message = 'A record with this unique identifier already exists.';
  } else if (err.name === 'SyntaxError' && 'body' in err) {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Malformed JSON payload in request body.';
  } else {
    // Unexpected Unhandled Error
    console.error('💥 Unhandled Exception:', err);
    message = env.NODE_ENV === 'production' ? 'An unexpected internal error occurred.' : err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(env.NODE_ENV === 'development' && !(err instanceof AppError)
      ? { stack: err.stack }
      : {}),
  });
}
