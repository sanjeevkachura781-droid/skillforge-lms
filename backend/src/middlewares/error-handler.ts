import { ErrorRequestHandler, Request, Response } from 'express';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error.js';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request: Request, response: Response, _next): void => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ success: false, message: error.message, error: { code: error.code, details: error.details } });
    return;
  }
  if (error instanceof ZodError) {
    response.status(400).json({ success: false, message: 'Request validation failed', error: { code: 'VALIDATION_ERROR', details: error.flatten() } });
    return;
  }
  if (error instanceof UniqueConstraintError) {
    response.status(409).json({ success: false, message: 'A record with the same unique value already exists', error: { code: 'DUPLICATE_RECORD' } });
    return;
  }
  if (error instanceof ValidationError) {
    response.status(400).json({ success: false, message: 'Database validation failed', error: { code: 'DATABASE_VALIDATION_ERROR', details: error.errors.map((item) => item.message) } });
    return;
  }
  console.error(error);
  response.status(500).json({ success: false, message: 'An unexpected server error occurred', error: { code: 'INTERNAL_SERVER_ERROR' } });
};
