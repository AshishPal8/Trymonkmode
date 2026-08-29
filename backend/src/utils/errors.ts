import { HttpStatus, type HttpStatusCode } from './httpStatus.js';

export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly errors?: unknown[];

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    isOperational = true,
    errors?: unknown[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errors?: unknown[]) {
    super(message, HttpStatus.BAD_REQUEST, true, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access. Please login.') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden. Insufficient permissions or tier required.') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Requested resource not found.') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict.') {
    super(message, HttpStatus.CONFLICT);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors?: unknown[]) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, true, errors);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'An unexpected internal server error occurred.') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, false);
  }
}
