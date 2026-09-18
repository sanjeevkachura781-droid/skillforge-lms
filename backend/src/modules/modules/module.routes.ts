import { Router } from 'express';
import { UserRole } from '../../database/models/index.js';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createModuleController, deleteModuleController, listCourseModulesController, updateModuleController } from './module.controller.js';
import { courseModulesSchema, moduleIdSchema, moduleUpdateSchema, moduleCreateSchema } from './module.schemas.js';

export const moduleRouter = Router();
moduleRouter.get('/courses/:courseId/modules', validate(courseModulesSchema), listCourseModulesController);
moduleRouter.post('/courses/:courseId/modules', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(moduleCreateSchema), createModuleController);
moduleRouter.patch('/modules/:id', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(moduleUpdateSchema), updateModuleController);
moduleRouter.delete('/modules/:id', requireAuth, requireRoles(UserRole.INSTRUCTOR), validate(moduleIdSchema), deleteModuleController);
