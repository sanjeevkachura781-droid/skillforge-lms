import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendSuccess } from '../../utils/api-response.js';
import { requireResourceId } from '../catalog-access.js';
import { createReview, listCourseReviews } from './review.service.js';

export const listReviewsController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Reviews retrieved', await listCourseReviews(requireResourceId(request.params.courseId as string, 'course')));
});

export const createReviewController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, 'Review created', await createReview(request.auth!.userId, requireResourceId(request.params.courseId as string, 'course'), request.body));
});
