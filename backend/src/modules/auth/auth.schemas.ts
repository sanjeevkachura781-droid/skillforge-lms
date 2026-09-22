import { z } from 'zod';
import { UserRole } from '../../database/models/index.js';

const credentials = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72).refine(
    (value) => Buffer.byteLength(value, 'utf8') <= 72,
    'Password must be at most 72 UTF-8 bytes',
  ),
});

export const registerSchema = z.object({
  body: credentials.extend({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    role: z.enum([UserRole.STUDENT, UserRole.INSTRUCTOR]).default(UserRole.STUDENT),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const loginSchema = z.object({
  body: credentials,
  params: z.object({}),
  query: z.object({}),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
