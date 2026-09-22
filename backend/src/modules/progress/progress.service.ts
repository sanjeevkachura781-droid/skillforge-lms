import { randomUUID } from 'node:crypto';
import { Course, Certificate, Enrollment, EnrollmentStatus, Lesson, LessonProgress, NotificationType } from '../../database/models/index.js';
import { sequelize } from '../../database/sequelize.js';
import { AppError } from '../../utils/app-error.js';
import { createNotification } from '../notifications/notification.service.js';
import { requireCourseEnrollment } from '../enrollments/enrollment.service.js';

async function lessonContext(lessonId: number) {
  const lesson = await Lesson.findByPk(lessonId, { include: [{ association: 'module', include: [{ association: 'course' }] }] });
  const module = lesson?.get('module') as import('../../database/models/index.js').CourseModule | undefined;
  const course = module?.get('course') as Course | undefined;
  if (!lesson || !module || !course) throw new AppError(404, 'Lesson not found', 'LESSON_NOT_FOUND');
  return { lesson, course };
}

function certificateNumber(): string {
  return `SF-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function completeLesson(studentId: number, lessonId: number) {
  const { course } = await lessonContext(lessonId);
  const enrollment = await requireCourseEnrollment(studentId, course.id);
  return sequelize.transaction(async (transaction) => {
    await enrollment.reload({ transaction, lock: transaction.LOCK.UPDATE });
    if (![EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED].includes(enrollment.status)) throw new AppError(403, 'You must enroll in this course first', 'ENROLLMENT_REQUIRED');
    const [progress] = await LessonProgress.findOrCreate({ where: { enrollmentId: enrollment.id, lessonId }, defaults: { enrollmentId: enrollment.id, lessonId, completed: true, completedAt: new Date() }, transaction });
    if (!progress.completed) await progress.update({ completed: true, completedAt: new Date() }, { transaction });

    const totalLessons = await Lesson.count({ include: [{ association: 'module', where: { courseId: course.id }, attributes: [] }], transaction });
    const completedLessons = await LessonProgress.count({ where: { enrollmentId: enrollment.id, completed: true }, transaction });
    let certificate: Certificate | null = null;
    if (totalLessons > 0 && completedLessons >= totalLessons) {
      if (enrollment.status !== EnrollmentStatus.COMPLETED) await enrollment.update({ status: EnrollmentStatus.COMPLETED, completedAt: new Date() }, { transaction });
      const result = await Certificate.findOrCreate({ where: { enrollmentId: enrollment.id }, defaults: { enrollmentId: enrollment.id, studentId, courseId: course.id, certificateNumber: certificateNumber(), issuedAt: new Date() }, transaction });
      certificate = result[0];
      if (result[1]) await createNotification({ userId: studentId, type: NotificationType.CERTIFICATE, title: 'Certificate earned', message: `You completed ${course.title}.` }, { transaction });
    }
    return { progress, completedLessons, totalLessons, percentage: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100), certificate };
  });
}

export async function getEnrollmentProgress(studentId: number, enrollmentId: number) {
  const enrollment = await Enrollment.findOne({ where: { id: enrollmentId, studentId, status: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] } });
  if (!enrollment) throw new AppError(404, 'Enrollment not found', 'ENROLLMENT_NOT_FOUND');
  const totalLessons = await Lesson.count({ include: [{ association: 'module', where: { courseId: enrollment.courseId }, attributes: [] }] });
  const completedLessons = await LessonProgress.count({ where: { enrollmentId, completed: true } });
  const progress = await LessonProgress.findAll({ where: { enrollmentId }, include: [{ association: 'lesson' }], order: [['updatedAt', 'DESC']] });
  return { enrollmentId, totalLessons, completedLessons, percentage: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100), progress };
}
