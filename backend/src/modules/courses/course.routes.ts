import { Router } from 'express';
import { UserRole } from '../../database/models/index.js';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { approveCourseController, createCourseController, getPublishedCourseController, listInstructorCoursesController, listPendingCoursesController, listPublishedCoursesController, rejectCourseController, submitCourseController, updateCourseController } from './course.controller.js';
import { courseCreateSchema, courseIdSchema, courseListSchema, courseSlugSchema, courseUpdateSchema } from './course.schemas.js';

export const courseRouter = Router();
courseRouter.get('/', validate(courseListSchema), listPublishedCoursesController);
courseRouter.get('/mine', requireAuth, requireRoles(UserRole.INSTRUCTOR), listInstructorCoursesController);
courseRouter.get('/pending', requireAuth, requireRoles(UserRole.ADMIN), listPendingCoursesController);
courseRouter.post('/', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(courseCreateSchema), createCourseController);
courseRouter.patch('/:id', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(courseUpdateSchema), updateCourseController);
courseRouter.post('/:id/submit', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(courseIdSchema), submitCourseController);
courseRouter.post('/:id/approve', requireAuth, requireRoles(UserRole.ADMIN), validate(courseIdSchema), approveCourseController);
courseRouter.post('/:id/reject', requireAuth, requireRoles(UserRole.ADMIN), validate(courseIdSchema), rejectCourseController);
courseRouter.get('/:slug', validate(courseSlugSchema), getPublishedCourseController);
