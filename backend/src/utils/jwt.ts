import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserRole } from '../database/models/index.js';

export type AuthTokenPayload = { sub: string; role: UserRole };

export function signAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as AuthTokenPayload;
}
