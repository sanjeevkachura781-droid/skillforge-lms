import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendSuccess } from '../../utils/api-response.js';
import { getCurrentUser, login, register } from './auth.service.js';

export const registerController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, 'Registration successful', await register(request.body));
});

export const loginController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Login successful', await login(request.body));
});

export const currentUserController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Current user retrieved', await getCurrentUser(request.auth!.userId));
});
