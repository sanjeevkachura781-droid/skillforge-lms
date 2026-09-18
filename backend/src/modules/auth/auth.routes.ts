import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { currentUserController, loginController, registerController } from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.schemas.js';

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, message: 'Too many authentication attempts, please try again later', error: { code: 'AUTH_RATE_LIMITED' } } });

export const authRouter = Router();
authRouter.post('/register', authLimiter, validate(registerSchema), registerController);
authRouter.post('/login', authLimiter, validate(loginSchema), loginController);
authRouter.get('/me', requireAuth, currentUserController);
