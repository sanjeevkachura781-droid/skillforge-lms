import { Course, CourseModule, CourseStatus, Lesson } from '../../database/models/index.js';
import { AppError } from '../../utils/app-error.js';
import { requireApprovedInstructor, requireResourceId } from '../catalog-access.js';

async function ownedEditableModule(moduleId: number, userId: number): Promise<CourseModule> {
  const module = await CourseModule.findByPk(moduleId, { include: [{ association: 'course' }] });
  const course = module?.get('course') as Course | undefined;
  if (!module || !course) throw new AppError(404, 'Module not found', 'MODULE_NOT_FOUND');
  if (course.instructorId !== userId) throw new AppError(403, 'You do not own this module', 'MODULE_NOT_OWNED');
  if (![CourseStatus.DRAFT, CourseStatus.REJECTED].includes(course.status)) throw new AppError(409, 'Only lessons in draft or rejected courses can be edited', 'LESSON_NOT_EDITABLE');
  return module;
}

async function ownedLesson(lessonId: number, userId: number): Promise<Lesson> {
  const lesson = await Lesson.findByPk(lessonId, { include: [{ association: 'module', include: [{ association: 'course' }] }] });
  const module = lesson?.get('module') as CourseModule | undefined;
  const course = module?.get('course') as Course | undefined;
  if (!lesson || !module || !course) throw new AppError(404, 'Lesson not found', 'LESSON_NOT_FOUND');
  if (course.instructorId !== userId) throw new AppError(403, 'You do not own this lesson', 'LESSON_NOT_OWNED');
  if (![CourseStatus.DRAFT, CourseStatus.REJECTED].includes(course.status)) throw new AppError(409, 'Only lessons in draft or rejected courses can be edited', 'LESSON_NOT_EDITABLE');
  return lesson;
}

export async function listModuleLessons(moduleId: number) {
  const module = await CourseModule.findOne({ where: { id: moduleId }, include: [{ association: 'course' }] });
  const course = module?.get('course') as Course | undefined;
  if (!module || !course || course.status !== CourseStatus.PUBLISHED) throw new AppError(404, 'Published module not found', 'MODULE_NOT_FOUND');
  return Lesson.findAll({ where: { moduleId }, order: [['position', 'ASC']] });
}

export async function createLesson(userId: number, moduleId: number, input: { title: string; content: string; videoUrl?: string | null; durationMinutes?: number | null; position: number; isPreview?: boolean }) {
  await requireApprovedInstructor(userId);
  await ownedEditableModule(moduleId, userId);
  return Lesson.create({ ...input, moduleId });
}

export async function updateLesson(userId: number, lessonId: number, input: Partial<{ title: string; content: string; videoUrl: string | null; durationMinutes: number | null; position: number; isPreview: boolean }>) {
  await requireApprovedInstructor(userId);
  const lesson = await ownedLesson(lessonId, userId);
  await lesson.update(input);
  return lesson;
}

export async function deleteLesson(userId: number, lessonId: number) {
  await requireApprovedInstructor(userId);
  const lesson = await ownedLesson(lessonId, userId);
  await lesson.destroy();
}

export function parseModuleId(value: string): number {
  return requireResourceId(value, 'module');
}

export function parseLessonId(value: string): number {
  return requireResourceId(value, 'lesson');
}
