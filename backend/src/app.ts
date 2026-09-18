import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFound } from './middlewares/not-found.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { certificateRouter } from './modules/certificates/certificate.routes.js';
import { categoryRouter } from './modules/categories/category.routes.js';
import { courseRouter } from './modules/courses/course.routes.js';
import { enrollmentRouter } from './modules/enrollments/enrollment.routes.js';
import { lessonRouter } from './modules/lessons/lesson.routes.js';
import { moduleRouter } from './modules/modules/module.routes.js';
import { notificationRouter } from './modules/notifications/notification.routes.js';
import { progressRouter } from './modules/progress/progress.routes.js';
import { quizRouter } from './modules/quizzes/quiz.routes.js';
import { reviewRouter } from './modules/reviews/review.routes.js';
import { userRouter } from './modules/users/user.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_request, response) => {
  response.json({ success: true, message: 'SkillForge API is healthy', data: { environment: env.NODE_ENV } });
});
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/courses', courseRouter);
app.use('/api', moduleRouter);
app.use('/api', lessonRouter);
app.use('/api/enrollments', enrollmentRouter);
app.use('/api', progressRouter);
app.use('/api/certificates', certificateRouter);
app.use('/api', quizRouter);
app.use('/api', reviewRouter);
app.use('/api/notifications', notificationRouter);
app.use(notFound);
app.use(errorHandler);
