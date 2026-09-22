import { publicCourse } from '../public-content.js';
import { Op } from 'sequelize';
import { Category, Course, CourseLevel, CourseStatus, Quiz, User } from '../../database/models/index.js';
import { AppError } from '../../utils/app-error.js';
import { requireApprovedInstructor } from '../catalog-access.js';
import { courseOutlineInclude } from '../content-includes.js';

const courseIncludes = [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }, { model: User, as: 'instructor', attributes: ['id', 'firstName', 'lastName'] }];

async function requireOwnedCourse(courseId: number, userId: number): Promise<Course> {
  const course = await Course.findByPk(courseId);
  if (!course) throw new AppError(404, 'Course not found', 'COURSE_NOT_FOUND');
  if (course.instructorId !== userId) throw new AppError(403, 'You do not own this course', 'COURSE_NOT_OWNED');
  return course;
}

export async function listPublishedCourses(input: { page: number; limit: number; search?: string; categoryId?: number; level?: CourseLevel }) {
  const page = Number(input.page) || 1;
  const limit = Number(input.limit) || 12;
  const where = { status: CourseStatus.PUBLISHED, ...(input.categoryId ? { categoryId: Number(input.categoryId) } : {}), ...(input.level ? { level: input.level } : {}), ...(input.search ? { [Op.or]: [{ title: { [Op.like]: `%${input.search}%` } }, { shortDescription: { [Op.like]: `%${input.search}%` } }] } : {}) };
  const result = await Course.findAndCountAll({ where, include: courseIncludes, order: [['createdAt', 'DESC'], ['id', 'DESC']], limit, offset: (page - 1) * limit, distinct: true });
  return { items: result.rows, pagination: { page, limit, total: result.count, totalPages: Math.ceil(result.count / limit) } };
}

export async function getPublishedCourse(slug: string) {
  const course = await Course.findOne({ where: { slug, status: CourseStatus.PUBLISHED }, include: [{ ...courseIncludes[0], required: false }, { ...courseIncludes[1], required: false }, courseOutlineInclude] });
  if (!course) throw new AppError(404, 'Published course not found', 'COURSE_NOT_FOUND');
  return publicCourse(course);
}

export async function listInstructorCourses(userId: number) {
  return Course.findAll({ where: { instructorId: userId }, include: courseIncludes, order: [['updatedAt', 'DESC']] });
}

export async function createCourse(userId: number, input: { categoryId: number; title: string; slug: string; shortDescription: string; description: string; thumbnailUrl?: string | null; level?: CourseLevel }) {
  await requireApprovedInstructor(userId);
  const category = await Category.findOne({ where: { id: input.categoryId, isActive: true } });
  if (!category) throw new AppError(400, 'An active category is required', 'CATEGORY_NOT_AVAILABLE');
  return Course.create({ ...input, instructorId: userId, status: CourseStatus.DRAFT });
}

export async function updateCourse(userId: number, courseId: number, input: Partial<{ categoryId: number; title: string; slug: string; shortDescription: string; description: string; thumbnailUrl: string | null; level: CourseLevel }>) {
  await requireApprovedInstructor(userId);
  const course = await requireOwnedCourse(courseId, userId);
  if (![CourseStatus.DRAFT, CourseStatus.REJECTED].includes(course.status)) throw new AppError(409, 'Only draft or rejected courses can be edited', 'COURSE_NOT_EDITABLE');
  if (input.categoryId) {
    const category = await Category.findOne({ where: { id: input.categoryId, isActive: true } });
    if (!category) throw new AppError(400, 'An active category is required', 'CATEGORY_NOT_AVAILABLE');
  }
  await course.update(input);
  return course;
}

export async function submitCourse(userId: number, courseId: number) {
  await requireApprovedInstructor(userId);
  const course = await requireOwnedCourse(courseId, userId);
  if (![CourseStatus.DRAFT, CourseStatus.REJECTED].includes(course.status)) throw new AppError(409, 'Only draft or rejected courses can be submitted', 'COURSE_NOT_SUBMITTABLE');
  const category = await Category.findOne({ where: { id: course.categoryId, isActive: true } });
  if (!category) throw new AppError(400, 'Select an active category before submitting', 'CATEGORY_NOT_AVAILABLE');
  const content = await Course.findByPk(courseId, { include: [{ association: 'modules', include: [{ association: 'lessons' }] }] });
  const outline = content?.toJSON() as unknown as { modules: Array<{ lessons: unknown[] }> };
  if (!outline.modules.length || outline.modules.some((module) => !module.lessons.length)) throw new AppError(400, 'Add at least one module and a lesson in every module before submitting', 'COURSE_EMPTY');
  if (await Quiz.count({ where: { courseId, isPublished: false } })) throw new AppError(400, 'Publish or remove every quiz before submitting the course', 'COURSE_QUIZ_UNPUBLISHED');
  await course.update({ status: CourseStatus.PENDING });
  return course;
}

export async function reviewCourse(courseId: number, status: CourseStatus.PUBLISHED | CourseStatus.REJECTED) {
  const course = await Course.findByPk(courseId);
  if (!course) throw new AppError(404, 'Course not found', 'COURSE_NOT_FOUND');
  if (course.status !== CourseStatus.PENDING) throw new AppError(409, 'Only pending courses can be reviewed', 'COURSE_NOT_PENDING');
  if (status === CourseStatus.PUBLISHED) await requireApprovedInstructor(course.instructorId);
  await course.update({ status });
  return course;
}

export async function listPendingCourses() {
  return Course.findAll({ where: { status: CourseStatus.PENDING }, include: courseIncludes, order: [['createdAt', 'ASC']] });
}

