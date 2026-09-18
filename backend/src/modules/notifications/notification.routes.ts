import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { listNotificationsController, markNotificationReadController } from './notification.controller.js';
import { notificationIdSchema } from './notification.schemas.js';

export const notificationRouter = Router();
notificationRouter.use(requireAuth);
notificationRouter.get('/', listNotificationsController);
notificationRouter.patch('/:id/read', validate(notificationIdSchema), markNotificationReadController);
