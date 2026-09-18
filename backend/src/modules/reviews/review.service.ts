import { Course, CourseStatus, NotificationType, Review, User } from '../../database/models/index.js';
import { AppError } from '../../utils/app-error.js';
import { createNotification } from '../notifications/notification.service.js';
import { requireCourseEnrollment } from '../enrollments/enrollment.service.js';

export async function createReview(studentId: number, courseId: number, input: { rating: number; comment?: string | null }) {
  const course = await Course.findOne({ where: { id: courseId, status: CourseStatus.PUBLISHED }, include: [{ model: User, as: 'instructor' }] });
  if (!course) throw new AppError(404, 'Published course not found', 'COURSE_NOT_FOUND');
  await requireCourseEnrollment(studentId, courseId);
  const existing = await Review.findOne({ where: { studentId, courseId } });
  if (existing) throw new AppError(409, 'You have already reviewed this course', 'DUPLICATE_REVIEW');
  const review = await Review.create({ studentId, courseId, rating: input.rating, comment: input.comment ?? null });
  const instructor = course.get('instructor') as User;
  await createNotification({ userId: instructor.id, type: NotificationType.REVIEW, title: 'New course review', message: `A student reviewed ${course.title}.` });
  return review;
}

export async function listCourseReviews(courseId: number) {
  return Review.findAll({ where: { courseId }, include: [{ model: User, as: 'student', attributes: ['id', 'firstName', 'lastName'] }], order: [['createdAt', 'DESC']] });
}
