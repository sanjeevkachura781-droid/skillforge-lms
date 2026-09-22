import { publicCourse } from '../public-content.js';
import { Course, CourseModule, CourseStatus } from '../../database/models/index.js';
import { AppError } from '../../utils/app-error.js';
import { requireApprovedInstructor, requireResourceId } from '../catalog-access.js';

async function ownedEditableCourse(courseId: number, userId: number): Promise<Course> {
  const course = await Course.findByPk(courseId);
  if (!course) throw new AppError(404, 'Course not found', 'COURSE_NOT_FOUND');
  if (course.instructorId !== userId) throw new AppError(403, 'You do not own this course', 'COURSE_NOT_OWNED');
  if (![CourseStatus.DRAFT, CourseStatus.REJECTED].includes(course.status)) throw new AppError(409, 'Only draft or rejected courses can be edited', 'COURSE_NOT_EDITABLE');
  return course;
}

async function ownedModule(moduleId: number, userId: number): Promise<CourseModule> {
  const module = await CourseModule.findByPk(moduleId, { include: [{ association: 'course' }] });
  const course = module?.get('course') as Course | undefined;
  if (!module || !course) throw new AppError(404, 'Module not found', 'MODULE_NOT_FOUND');
  if (course.instructorId !== userId) throw new AppError(403, 'You do not own this module', 'MODULE_NOT_OWNED');
  if (![CourseStatus.DRAFT, CourseStatus.REJECTED].includes(course.status)) throw new AppError(409, 'Only modules in draft or rejected courses can be edited', 'MODULE_NOT_EDITABLE');
  return module;
}

export async function listCourseModules(courseId: number) {
  const course = await Course.findOne({ where: { id: courseId, status: CourseStatus.PUBLISHED } });
  if (!course) throw new AppError(404, 'Published course not found', 'COURSE_NOT_FOUND');
  const modules = await CourseModule.findAll({ where: { courseId }, include: [{ association: 'lessons', separate: true, order: [['position', 'ASC']] }], order: [['position', 'ASC']] });
  return publicCourse({ toJSON: () => ({ modules: modules.map((module) => module.toJSON()) }) }).modules;
}

export async function createModule(userId: number, courseId: number, input: { title: string; description?: string | null; position: number }) {
  await requireApprovedInstructor(userId);
  await ownedEditableCourse(courseId, userId);
  return CourseModule.create({ ...input, courseId });
}

export async function updateModule(userId: number, moduleId: number, input: Partial<{ title: string; description: string | null; position: number }>) {
  await requireApprovedInstructor(userId);
  const module = await ownedModule(moduleId, userId);
  await module.update(input);
  return module;
}

export async function deleteModule(userId: number, moduleId: number) {
  await requireApprovedInstructor(userId);
  const module = await ownedModule(moduleId, userId);
  await module.destroy();
}

export function parseCourseId(value: string): number {
  return requireResourceId(value, 'course');
}

export function parseModuleId(value: string): number {
  return requireResourceId(value, 'module');
}
