import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendSuccess } from '../../utils/api-response.js';
import { createCategory, deactivateCategory, listCategories, updateCategory } from './category.service.js';

export const listCategoriesController = asyncHandler(async (_request: Request, response: Response) => {
  sendSuccess(response, 200, 'Categories retrieved', await listCategories());
});

export const createCategoryController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, 'Category created', await createCategory(request.body));
});

export const updateCategoryController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Category updated', await updateCategory(Number(request.params.id), request.body));
});

export const deleteCategoryController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Category deactivated', await deactivateCategory(Number(request.params.id)));
});
