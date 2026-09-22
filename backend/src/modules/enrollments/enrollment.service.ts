import {
  Course,
  CourseStatus,
  Enrollment,
  EnrollmentStatus,
  NotificationType,
  User,
} from '../../database/models/index.js';
import { sequelize } from '../../database/sequelize.js';
import { AppError } from '../../utils/app-error.js';
import { createNotification } from '../notifications/notification.service.js';
import { courseOutlineInclude } from '../content-includes.js';

const courseWithLearningContent = {
  model: Course,
  as: 'course',
  include: [
    { association: 'quizzes', where: { isPublished: true }, required: false, attributes: ['id', 'title', 'passingPercentage'] },
    courseOutlineInclude,
  ],
};

export async function enrollStudent(studentId: number, courseId: number) {
  const course = await Course.findOne({
    where: {
      id: courseId,
      status: CourseStatus.PUBLISHED,
    },
  });

  if (!course) {
    throw new AppError(
      404,
      'Published course not found',
      'COURSE_NOT_FOUND'
    );
  }

  const existing = await Enrollment.findOne({
    where: {
      studentId,
      courseId,
    },
  });

  if (existing) {
    throw new AppError(
      409,
      'You are already enrolled in this course',
      'DUPLICATE_ENROLLMENT'
    );
  }

  return sequelize.transaction(async (transaction) => {
    const enrollment = await Enrollment.create(
      {
        studentId,
        courseId,
        status: EnrollmentStatus.ACTIVE,
        enrolledAt: new Date(),
        completedAt: null,
      },
      { transaction }
    );

    await createNotification(
      {
        userId: studentId,
        type: NotificationType.ENROLLMENT,
        title: 'Course enrollment confirmed',
        message: `You are enrolled in ${course.title}.`,
      },
      { transaction }
    );

    return Enrollment.findByPk(enrollment.id, {
      include: [courseWithLearningContent],
      transaction,
    });
  });
}

export async function listStudentEnrollments(studentId: number) {
  return Enrollment.findAll({
    where: { studentId, status: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
    include: [courseWithLearningContent],
    order: [['enrolledAt', 'DESC']],
  });
}

export async function getStudentEnrollment(
  studentId: number,
  enrollmentId: number
) {
  const enrollment = await Enrollment.findOne({
    where: {
      id: enrollmentId,
      studentId,
      status: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED],
    },
    include: [courseWithLearningContent],
  });

  if (!enrollment) {
    throw new AppError(
      404,
      'Enrollment not found',
      'ENROLLMENT_NOT_FOUND'
    );
  }

  return enrollment;
}

export async function requireCourseEnrollment(
  studentId: number,
  courseId: number
) {
  const enrollment = await Enrollment.findOne({
    where: {
      studentId,
      courseId,
      status: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED],
    },
  });

  if (!enrollment) {
    throw new AppError(
      403,
      'You must enroll in this course first',
      'ENROLLMENT_REQUIRED'
    );
  }

  return enrollment;
}

export async function getInstructorForCourse(courseId: number) {
  const course = await Course.findByPk(courseId, {
    include: [
      {
        model: User,
        as: 'instructor',
      },
    ],
  });

  if (!course) {
    throw new AppError(
      404,
      'Course not found',
      'COURSE_NOT_FOUND'
    );
  }

  return course.get('instructor') as User;
}
