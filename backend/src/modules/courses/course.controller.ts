import { Request, Response } from 'express';
import { CourseStatus } from '../../database/models/index.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendSuccess } from '../../utils/api-response.js';
import { requireResourceId } from '../catalog-access.js';
import { createCourse, getPublishedCourse, listInstructorCourses, listPendingCourses, listPublishedCourses, reviewCourse, submitCourse, updateCourse } from './course.service.js';

export const listPublishedCoursesController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Published courses retrieved', await listPublishedCourses(request.query as never));
});

export const getPublishedCourseController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Course retrieved', await getPublishedCourse(request.params.slug as string));
});

export const listInstructorCoursesController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Instructor courses retrieved', await listInstructorCourses(request.auth!.userId));
});

export const createCourseController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, 'Course created', await createCourse(request.auth!.userId, request.body));
});

export const updateCourseController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Course updated', await updateCourse(request.auth!.userId, requireResourceId(request.params.id as string, 'course'), request.body));
});

export const submitCourseController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Course submitted for approval', await submitCourse(request.auth!.userId, requireResourceId(request.params.id as string, 'course')));
});

export const listPendingCoursesController = asyncHandler(async (_request: Request, response: Response) => {
  sendSuccess(response, 200, 'Pending courses retrieved', await listPendingCourses());
});

export const approveCourseController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Course approved', await reviewCourse(requireResourceId(request.params.id as string, 'course'), CourseStatus.PUBLISHED));
});

export const rejectCourseController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Course rejected', await reviewCourse(requireResourceId(request.params.id as string, 'course'), CourseStatus.REJECTED));
});

