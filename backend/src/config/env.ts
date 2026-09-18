import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url().default('mysql://skillforge:password@localhost:3306/skillforge'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must contain at least 32 characters').default('development-only-secret-change-me-123456'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
});

export const env = envSchema.parse(process.env);
