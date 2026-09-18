import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import { UserRole } from '../../database/models/index.js';
import { currentUserController } from '../auth/auth.controller.js';

export const userRouter = Router();
userRouter.get('/me', requireAuth, currentUserController);
userRouter.get('/admin-only-check', requireAuth, requireRoles(UserRole.ADMIN), (_request, response) => {
  response.json({ success: true, message: 'Admin authorization successful', data: null });
});
