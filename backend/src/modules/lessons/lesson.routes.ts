import { Router } from 'express';
import { UserRole } from '../../database/models/index.js';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createLessonController, deleteLessonController, listModuleLessonsController, updateLessonController } from './lesson.controller.js';
import { lessonCreateSchema, lessonIdSchema, lessonUpdateSchema, moduleLessonsSchema } from './lesson.schemas.js';

export const lessonRouter = Router();
lessonRouter.get('/modules/:moduleId/lessons', validate(moduleLessonsSchema), listModuleLessonsController);
lessonRouter.post('/modules/:moduleId/lessons', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(lessonCreateSchema), createLessonController);
lessonRouter.patch('/lessons/:id', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(lessonUpdateSchema), updateLessonController);
lessonRouter.delete('/lessons/:id', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(lessonIdSchema), deleteLessonController);
