import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendSuccess } from '../../utils/api-response.js';
import { createModule, deleteModule, listCourseModules, parseCourseId, parseModuleId, updateModule } from './module.service.js';

export const listCourseModulesController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Course modules retrieved', await listCourseModules(parseCourseId(request.params.courseId as string)));
});

export const createModuleController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, 'Module created', await createModule(request.auth!.userId, parseCourseId(request.params.courseId as string), request.body));
});

export const updateModuleController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Module updated', await updateModule(request.auth!.userId, parseModuleId(request.params.id as string), request.body));
});

export const deleteModuleController = asyncHandler(async (request: Request, response: Response) => {
  await deleteModule(request.auth!.userId, parseModuleId(request.params.id as string));
  sendSuccess(response, 200, 'Module deleted', null);
});
