import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendSuccess } from '../../utils/api-response.js';
import { requireResourceId } from '../catalog-access.js';
import { listNotifications, markNotificationRead } from './notification.service.js';

export const listNotificationsController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Notifications retrieved', await listNotifications(request.auth!.userId));
});

export const markNotificationReadController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Notification marked as read', await markNotificationRead(request.auth!.userId, requireResourceId(request.params.id as string, 'notification')));
});
