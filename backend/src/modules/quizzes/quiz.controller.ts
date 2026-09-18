import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendSuccess } from '../../utils/api-response.js';
import { requireResourceId } from '../catalog-access.js';
import { addQuestion, createQuiz, getQuizForStudent, getStudentAttempt, parseAttemptId, parseQuizId, publishQuiz, submitQuiz } from './quiz.service.js';

export const createQuizController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, 'Quiz created', await createQuiz(request.auth!.userId, requireResourceId(request.params.courseId as string, 'course'), request.body));
});

export const addQuestionController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, 'Quiz question created', await addQuestion(request.auth!.userId, parseQuizId(request.params.quizId as string), request.body));
});

export const publishQuizController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Quiz published', await publishQuiz(request.auth!.userId, parseQuizId(request.params.quizId as string)));
});

export const getQuizController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Quiz retrieved', await getQuizForStudent(request.auth!.userId, parseQuizId(request.params.quizId as string)));
});

export const submitQuizController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, 'Quiz attempt recorded', await submitQuiz(request.auth!.userId, parseQuizId(request.params.quizId as string), request.body.answers));
});

export const getAttemptController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Quiz attempt retrieved', await getStudentAttempt(request.auth!.userId, parseAttemptId(request.params.id as string)));
});
