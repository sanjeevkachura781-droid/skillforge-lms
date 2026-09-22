import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendSuccess } from '../../utils/api-response.js';
import { requireResourceId } from '../catalog-access.js';
import { createCategory, deactivateCategory, listCategories, updateCategory } from './category.service.js';

export const listCategoriesController = asyncHandler(async (_request: Request, response: Response) => {
  sendSuccess(response, 200, 'Categories retrieved', await listCategories());
});

export const createCategoryController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, 'Category created', await createCategory(request.body));
});

export const updateCategoryController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Category updated', await updateCategory(requireResourceId(request.params.id as string, 'category'), request.body));
});

export const deleteCategoryController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Category deactivated', await deactivateCategory(requireResourceId(request.params.id as string, 'category')));
});
