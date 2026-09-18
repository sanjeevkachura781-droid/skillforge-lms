import { Router } from 'express';
import { UserRole } from '../../database/models/index.js';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { completeLessonController, getProgressController } from './progress.controller.js';
import { enrollmentProgressSchema, lessonProgressSchema } from './progress.schemas.js';

export const progressRouter = Router();
progressRouter.post('/lessons/:lessonId/complete', requireAuth, requireRoles(UserRole.STUDENT), validate(lessonProgressSchema), completeLessonController);
progressRouter.get('/enrollments/:enrollmentId/progress', requireAuth, requireRoles(UserRole.STUDENT), validate(enrollmentProgressSchema), getProgressController);
