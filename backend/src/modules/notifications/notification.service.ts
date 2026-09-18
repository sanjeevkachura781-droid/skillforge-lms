import { Notification, NotificationType } from '../../database/models/index.js';
import { AppError } from '../../utils/app-error.js';

export async function createNotification(input: { userId: number; type: NotificationType; title: string; message: string }, transaction?: Parameters<typeof Notification.create>[1]) {
  return Notification.create(input, transaction);
}

export async function listNotifications(userId: number) {
  return Notification.findAll({ where: { userId }, order: [['createdAt', 'DESC']], limit: 50 });
}

export async function markNotificationRead(userId: number, notificationId: number) {
  const notification = await Notification.findOne({ where: { id: notificationId, userId } });
  if (!notification) throw new AppError(404, 'Notification not found', 'NOTIFICATION_NOT_FOUND');
  await notification.update({ readAt: new Date() });
  return notification;
}
