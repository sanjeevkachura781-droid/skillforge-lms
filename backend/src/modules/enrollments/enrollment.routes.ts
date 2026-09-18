import { Router } from 'express';
import { UserRole } from '../../database/models/index.js';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { enrollController, getEnrollmentController, listEnrollmentsController } from './enrollment.controller.js';
import { courseEnrollmentSchema, enrollmentIdSchema } from './enrollment.schemas.js';

export const enrollmentRouter = Router();
enrollmentRouter.use(requireAuth, requireRoles(UserRole.STUDENT));
enrollmentRouter.get('/mine', listEnrollmentsController);
enrollmentRouter.get('/:id', validate(enrollmentIdSchema), getEnrollmentController);
enrollmentRouter.post('/courses/:courseId', validate(courseEnrollmentSchema), enrollController);
