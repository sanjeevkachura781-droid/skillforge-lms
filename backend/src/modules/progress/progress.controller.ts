import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendSuccess } from '../../utils/api-response.js';
import { requireResourceId } from '../catalog-access.js';
import { completeLesson, getEnrollmentProgress } from './progress.service.js';

export const completeLessonController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Lesson marked as completed', await completeLesson(request.auth!.userId, requireResourceId(request.params.lessonId as string, 'lesson')));
});

export const getProgressController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Course progress retrieved', await getEnrollmentProgress(request.auth!.userId, requireResourceId(request.params.enrollmentId as string, 'enrollment')));
});
