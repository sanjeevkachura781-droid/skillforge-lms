import { Router } from 'express';
import { UserRole } from '../../database/models/index.js';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { addQuestionController, createQuizController, deleteQuestionController, deleteQuizController, getAttemptController, getQuizController, publishQuizController, submitQuizController, updateQuestionController, updateQuizController } from './quiz.controller.js';
import { attemptIdSchema, questionCreateSchema, questionIdSchema, questionUpdateSchema, quizAttemptSchema, quizCreateSchema, quizIdSchema, quizUpdateSchema } from './quiz.schemas.js';

export const quizRouter = Router();
quizRouter.post('/courses/:courseId/quizzes', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(quizCreateSchema), createQuizController);
quizRouter.post('/quizzes/:quizId/questions', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(questionCreateSchema), addQuestionController);
quizRouter.post('/quizzes/:quizId/publish', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(quizIdSchema), publishQuizController);
quizRouter.patch('/quizzes/:quizId', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(quizUpdateSchema), updateQuizController);
quizRouter.delete('/quizzes/:quizId', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(quizIdSchema), deleteQuizController);
quizRouter.patch('/quiz-questions/:questionId', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(questionUpdateSchema), updateQuestionController);
quizRouter.delete('/quiz-questions/:questionId', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(questionIdSchema), deleteQuestionController);
quizRouter.get('/quizzes/:quizId', requireAuth, requireRoles(UserRole.STUDENT), validate(quizIdSchema), getQuizController);
quizRouter.post('/quizzes/:quizId/attempts', requireAuth, requireRoles(UserRole.STUDENT), validate(quizAttemptSchema), submitQuizController);
quizRouter.get('/quiz-attempts/:id', requireAuth, requireRoles(UserRole.STUDENT), validate(attemptIdSchema), getAttemptController);
