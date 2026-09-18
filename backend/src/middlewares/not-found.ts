import { Request, Response } from 'express';

export function notFound(request: Request, response: Response): void {
  response.status(404).json({ success: false, message: `Route not found: ${request.method} ${request.originalUrl}`, error: { code: 'NOT_FOUND' } });
}
