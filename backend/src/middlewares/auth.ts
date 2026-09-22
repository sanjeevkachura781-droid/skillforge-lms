import { NextFunction, Request, Response } from 'express';
import { User, UserStatus, UserRole } from '../database/models/index.js';
import { AppError } from '../utils/app-error.js';
import { verifyAccessToken } from '../utils/jwt.js';

export async function requireAuth(request: Request, _response: Response, next: NextFunction): Promise<void> {
  const header = request.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) {
    next(new AppError(401, 'Authentication is required', 'AUTHENTICATION_REQUIRED'));
    return;
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
    if (!Number.isSafeInteger(Number(payload.sub)) || Number(payload.sub) <= 0) throw new Error('Invalid token subject');
  } catch {
    next(new AppError(401, 'Invalid or expired access token', 'INVALID_TOKEN'));
    return;
  }

  try {
    const user = await User.findByPk(Number(payload.sub));
    if (!user || user.status !== UserStatus.ACTIVE) { next(new AppError(401, 'Account is unavailable', 'INVALID_TOKEN')); return; }
    request.auth = { userId: user.id, role: user.role };
    next();
  } catch (error) {
    next(error);
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
