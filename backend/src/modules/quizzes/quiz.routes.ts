import { Router } from 'express';
import { UserRole } from '../../database/models/index.js';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { addQuestionController, createQuizController, getAttemptController, getQuizController, publishQuizController, submitQuizController } from './quiz.controller.js';
import { attemptIdSchema, questionCreateSchema, quizAttemptSchema, quizCreateSchema, quizIdSchema } from './quiz.schemas.js';

export const quizRouter = Router();
quizRouter.post('/courses/:courseId/quizzes', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(quizCreateSchema), createQuizController);
quizRouter.post('/quizzes/:quizId/questions', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(questionCreateSchema), addQuestionController);
quizRouter.post('/quizzes/:quizId/publish', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(quizIdSchema), publishQuizController);
quizRouter.get('/quizzes/:quizId', requireAuth, requireRoles(UserRole.STUDENT), validate(quizIdSchema), getQuizController);
quizRouter.post('/quizzes/:quizId/attempts', requireAuth, requireRoles(UserRole.STUDENT), validate(quizAttemptSchema), submitQuizController);
quizRouter.get('/quiz-attempts/:id', requireAuth, requireRoles(UserRole.STUDENT), validate(attemptIdSchema), getAttemptController);
