import { Router } from 'express';
import { UserRole } from '../../database/models/index.js';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createReviewController, listReviewsController } from './review.controller.js';
import { courseReviewListSchema, reviewCreateSchema } from './review.schemas.js';

export const reviewRouter = Router();
reviewRouter.get('/courses/:courseId/reviews', validate(courseReviewListSchema), listReviewsController);
reviewRouter.post('/courses/:courseId/reviews', requireAuth, requireRoles(UserRole.STUDENT), validate(reviewCreateSchema), createReviewController);
