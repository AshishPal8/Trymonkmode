import { Response } from 'express';
import { HttpStatus, type HttpStatusCode } from './httpStatus.js';

export interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: HttpStatusCode;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export function sendResponse<T>({
  res,
  statusCode = HttpStatus.OK,
  message = 'Success',
  data,
  meta,
}: ApiResponseOptions<T>) {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data: data !== undefined ? data : null,
    ...(meta ? { meta } : {}),
  });
}
