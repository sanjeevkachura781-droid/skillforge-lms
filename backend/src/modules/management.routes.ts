import { Router } from 'express';
import { z } from 'zod';
import { Category, Course, InstructorProfile, UserRole } from '../database/models/index.js';
import { requireAuth, requireRoles } from '../middlewares/auth.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';
import { AppError } from '../utils/app-error.js';
import { requireResourceId } from './catalog-access.js';
import { courseOutlineInclude, quizQuestionsInclude } from './content-includes.js';

export const managementRouter = Router();
managementRouter.get('/instructor/courses/:id', requireAuth, requireRoles(UserRole.INSTRUCTOR, UserRole.ADMIN), asyncHandler(async (req, res) => {
  const course = await Course.findByPk(requireResourceId(String(req.params.id), 'course'), { include: [courseOutlineInclude, { association: 'quizzes', separate: true, order: [['id', 'ASC']], include: [quizQuestionsInclude(true)] }] });
  if (!course) throw new AppError(404, 'Course not found', 'COURSE_NOT_FOUND');
  if (req.auth!.role !== UserRole.ADMIN && course.instructorId !== req.auth!.userId) throw new AppError(403, 'You do not own this course', 'FORBIDDEN');
  sendSuccess(res, 200, 'Course workspace', course);
}));
managementRouter.get('/admin/instructors', requireAuth, requireRoles(UserRole.ADMIN), asyncHandler(async (_req, res) => {
  const profiles = await InstructorProfile.findAll({ include: [{ association: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }], order: [['createdAt', 'DESC']] });
  sendSuccess(res, 200, 'Instructor applications', profiles);
}));
managementRouter.patch('/admin/instructors/:id', requireAuth, requireRoles(UserRole.ADMIN), asyncHandler(async (req, res) => {
  const input = z.object({ approvalStatus: z.enum(['approved', 'rejected']) }).parse(req.body);
  const profile = await InstructorProfile.findByPk(requireResourceId(String(req.params.id), 'profile'));
  if (!profile) throw new AppError(404, 'Instructor not found', 'NOT_FOUND');
  await profile.update(input as Parameters<typeof profile.update>[0]);
  sendSuccess(res, 200, 'Instructor updated', profile);
}));
managementRouter.get('/admin/categories', requireAuth, requireRoles(UserRole.ADMIN), asyncHandler(async (_req, res) => {
  sendSuccess(res, 200, 'All categories', await Category.findAll({ order: [['name', 'ASC']] }));
}));
