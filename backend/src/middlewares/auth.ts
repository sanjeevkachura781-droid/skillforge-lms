import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../database/models/index.js';
import { AppError } from '../utils/app-error.js';
import { verifyAccessToken } from '../utils/jwt.js';

export function requireAuth(request: Request, _response: Response, next: NextFunction): void {
  const header = request.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) {
    next(new AppError(401, 'Authentication is required', 'AUTHENTICATION_REQUIRED'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    request.auth = { userId: Number(payload.sub), role: payload.role };
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired access token', 'INVALID_TOKEN'));
  }
}

export function requireRoles(...roles: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.auth || !roles.includes(request.auth.role)) {
      next(new AppError(403, 'You do not have permission to perform this action', 'FORBIDDEN'));
      return;
    }
    next();
  };
}
