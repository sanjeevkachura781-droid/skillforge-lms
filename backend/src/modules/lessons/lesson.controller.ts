import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendSuccess } from '../../utils/api-response.js';
import { createLesson, deleteLesson, listModuleLessons, parseLessonId, parseModuleId, updateLesson } from './lesson.service.js';

export const listModuleLessonsController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Module lessons retrieved', await listModuleLessons(parseModuleId(request.params.moduleId as string)));
});

export const createLessonController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, 'Lesson created', await createLesson(request.auth!.userId, parseModuleId(request.params.moduleId as string), request.body));
});

export const updateLessonController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Lesson updated', await updateLesson(request.auth!.userId, parseLessonId(request.params.id as string), request.body));
});

export const deleteLessonController = asyncHandler(async (request: Request, response: Response) => {
  await deleteLesson(request.auth!.userId, parseLessonId(request.params.id as string));
  sendSuccess(response, 200, 'Lesson deleted', null);
});
