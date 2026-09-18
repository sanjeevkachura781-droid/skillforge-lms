import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { UserRole } from '../../database/models/index.js';
import { createCategoryController, deleteCategoryController, listCategoriesController, updateCategoryController } from './category.controller.js';
import { categoryCreateSchema, categoryIdSchema, categoryUpdateSchema } from './category.schemas.js';

export const categoryRouter = Router();
categoryRouter.get('/', listCategoriesController);
categoryRouter.post('/', requireAuth, requireRoles(UserRole.ADMIN), validate(categoryCreateSchema), createCategoryController);
categoryRouter.patch('/:id', requireAuth, requireRoles(UserRole.ADMIN), validate(categoryUpdateSchema), updateCategoryController);
categoryRouter.delete('/:id', requireAuth, requireRoles(UserRole.ADMIN), validate(categoryIdSchema), deleteCategoryController);
