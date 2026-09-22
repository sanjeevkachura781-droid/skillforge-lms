import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendSuccess } from '../../utils/api-response.js';
import { requireResourceId } from '../catalog-access.js';
import { addQuestion, createQuiz, deleteQuestion, deleteQuiz, getQuizForStudent, getStudentAttempt, parseAttemptId, parseQuizId, publishQuiz, submitQuiz, updateQuestion, updateQuiz } from './quiz.service.js';

export const createQuizController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, 'Quiz created', await createQuiz(request.auth!.userId, requireResourceId(request.params.courseId as string, 'course'), request.body));
});

export const addQuestionController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, 'Quiz question created', await addQuestion(request.auth!.userId, parseQuizId(request.params.quizId as string), request.body));
});

export const publishQuizController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Quiz published', await publishQuiz(request.auth!.userId, parseQuizId(request.params.quizId as string)));
});

export const updateQuizController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Quiz updated', await updateQuiz(request.auth!.userId, parseQuizId(request.params.quizId as string), request.body));
});

export const deleteQuizController = asyncHandler(async (request: Request, response: Response) => {
  await deleteQuiz(request.auth!.userId, parseQuizId(request.params.quizId as string));
  sendSuccess(response, 200, 'Quiz deleted', null);
});

export const updateQuestionController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Question updated', await updateQuestion(request.auth!.userId, requireResourceId(request.params.questionId as string, 'question'), request.body));
});

export const deleteQuestionController = asyncHandler(async (request: Request, response: Response) => {
  await deleteQuestion(request.auth!.userId, requireResourceId(request.params.questionId as string, 'question'));
  sendSuccess(response, 200, 'Question deleted', null);
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
