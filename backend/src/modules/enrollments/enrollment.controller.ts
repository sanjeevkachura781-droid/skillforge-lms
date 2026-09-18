import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendSuccess } from '../../utils/api-response.js';
import { requireResourceId } from '../catalog-access.js';
import { enrollStudent, getStudentEnrollment, listStudentEnrollments } from './enrollment.service.js';

export const enrollController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, 'Enrollment created', await enrollStudent(request.auth!.userId, requireResourceId(request.params.courseId as string, 'course')));
});

export const listEnrollmentsController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Enrollments retrieved', await listStudentEnrollments(request.auth!.userId));
});

export const getEnrollmentController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Enrollment retrieved', await getStudentEnrollment(request.auth!.userId, requireResourceId(request.params.id as string, 'enrollment')));
});
