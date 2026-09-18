import bcrypt from 'bcrypt';
import { env } from '../config/env.js';
import { Category, Course, CourseLevel, CourseModule, CourseStatus, Enrollment, EnrollmentStatus, InstructorApprovalStatus, InstructorProfile, Lesson, Quiz, QuizOption, QuizQuestion, User, UserRole, UserStatus } from './models/index.js';
import { sequelize } from './sequelize.js';

async function seed(): Promise<void> {
  await sequelize.authenticate();
  const accounts = [
    { firstName: 'SkillForge', lastName: 'Admin', email: 'admin@skillforge.test', password: 'Admin@12345', role: UserRole.ADMIN },
    { firstName: 'Demo', lastName: 'Instructor', email: 'instructor@skillforge.test', password: 'Instructor@12345', role: UserRole.INSTRUCTOR },
    { firstName: 'Demo', lastName: 'Student', email: 'student@skillforge.test', password: 'Student@12345', role: UserRole.STUDENT },
  ];
  const users = new Map<UserRole, User>();
  for (const account of accounts) {
    const [user] = await User.findOrCreate({ where: { email: account.email }, defaults: { firstName: account.firstName, lastName: account.lastName, email: account.email, passwordHash: await bcrypt.hash(account.password, env.BCRYPT_ROUNDS), role: account.role, status: UserStatus.ACTIVE } });
    users.set(account.role, user);
    if (user.role === UserRole.INSTRUCTOR) {
      await InstructorProfile.findOrCreate({ where: { userId: user.id }, defaults: { userId: user.id, bio: 'Development instructor profile', approvalStatus: InstructorApprovalStatus.APPROVED } });
    }
  }
  const categoryData = [
    { name: 'Web Development', slug: 'web-development', description: 'Frontend and backend web engineering.' },
    { name: 'Data Engineering', slug: 'data-engineering', description: 'Reliable data systems and pipelines.' },
  ];
  const categories = new Map<string, Category>();
  for (const data of categoryData) {
    const [category] = await Category.findOrCreate({ where: { slug: data.slug }, defaults: data });
    categories.set(data.slug, category);
  }

  const instructor = users.get(UserRole.INSTRUCTOR);
  const student = users.get(UserRole.STUDENT);
  const webCategory = categories.get('web-development');
  if (!instructor || !student || !webCategory) throw new Error('Seed prerequisites were not created');

  await sequelize.transaction(async (transaction) => {
    const [course] = await Course.findOrCreate({
      where: { slug: 'typescript-api-foundations' },
      defaults: { instructorId: instructor.id, categoryId: webCategory.id, title: 'TypeScript API Foundations', slug: 'typescript-api-foundations', shortDescription: 'Build maintainable APIs with TypeScript and Express.', description: 'A practical introduction to typed API design, validation, and service boundaries.', level: CourseLevel.BEGINNER, status: CourseStatus.PUBLISHED },
      transaction,
    });
    const [module] = await CourseModule.findOrCreate({ where: { courseId: course.id, position: 1 }, defaults: { courseId: course.id, title: 'API Fundamentals', description: 'The foundations of a production API.', position: 1 }, transaction });
    await Lesson.findOrCreate({ where: { moduleId: module.id, position: 1 }, defaults: { moduleId: module.id, title: 'Request validation', content: 'Learn why every boundary should validate incoming data.', position: 1, durationMinutes: 15, isPreview: true }, transaction });
    await Lesson.findOrCreate({ where: { moduleId: module.id, position: 2 }, defaults: { moduleId: module.id, title: 'Service boundaries', content: 'Keep controllers thin and business rules testable.', position: 2, durationMinutes: 20, isPreview: false }, transaction });
    await Enrollment.findOrCreate({ where: { studentId: student.id, courseId: course.id }, defaults: { studentId: student.id, courseId: course.id, status: EnrollmentStatus.ACTIVE, enrolledAt: new Date(), completedAt: null }, transaction });
    const [quiz] = await Quiz.findOrCreate({ where: { courseId: course.id, title: 'API Foundations Checkpoint' }, defaults: { courseId: course.id, title: 'API Foundations Checkpoint', description: 'Review the core concepts from the course.', passingPercentage: 70, isPublished: true }, transaction });
    const [question] = await QuizQuestion.findOrCreate({ where: { quizId: quiz.id, position: 1 }, defaults: { quizId: quiz.id, questionText: 'What should validate incoming API data?', position: 1, points: 1 }, transaction });
    await QuizOption.findOrCreate({ where: { questionId: question.id, position: 1 }, defaults: { questionId: question.id, optionText: 'The request boundary', position: 1, isCorrect: true }, transaction });
    await QuizOption.findOrCreate({ where: { questionId: question.id, position: 2 }, defaults: { questionId: question.id, optionText: 'Only the database', position: 2, isCorrect: false }, transaction });
  });
  console.log('SkillForge demo accounts and catalog data seeded.');
  await sequelize.close();
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
