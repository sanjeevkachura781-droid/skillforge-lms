import { Course, CourseStatus, NotificationType, Quiz, QuizAttempt, QuizOption, QuizQuestion } from '../../database/models/index.js';
import { sequelize } from '../../database/sequelize.js';
import { AppError } from '../../utils/app-error.js';
import { requireApprovedInstructor, requireResourceId } from '../catalog-access.js';
import { requireCourseEnrollment } from '../enrollments/enrollment.service.js';
import { createNotification } from '../notifications/notification.service.js';
import { quizQuestionsInclude } from '../content-includes.js';

async function ownedEditableCourse(courseId: number, userId: number): Promise<Course> {
  const course = await Course.findByPk(courseId);
  if (!course) throw new AppError(404, 'Course not found', 'COURSE_NOT_FOUND');
  if (course.instructorId !== userId) throw new AppError(403, 'You do not own this course', 'COURSE_NOT_OWNED');
  if (![CourseStatus.DRAFT, CourseStatus.REJECTED].includes(course.status)) throw new AppError(409, 'Only draft or rejected courses can be edited', 'COURSE_NOT_EDITABLE');
  return course;
}

async function ownedQuiz(quizId: number, userId: number): Promise<Quiz> {
  const quiz = await Quiz.findByPk(quizId, { include: [{ association: 'course' }] });
  const course = quiz?.get('course') as Course | undefined;
  if (!quiz || !course) throw new AppError(404, 'Quiz not found', 'QUIZ_NOT_FOUND');
  if (course.instructorId !== userId) throw new AppError(403, 'You do not own this quiz', 'QUIZ_NOT_OWNED');
  if (![CourseStatus.DRAFT, CourseStatus.REJECTED].includes(course.status)) throw new AppError(409, 'Only quizzes in draft or rejected courses can be edited', 'QUIZ_NOT_EDITABLE');
  return quiz;
}

export type ScoringQuestion = { id: number; points: number; options: { id: number; isCorrect: boolean }[] };

export function calculateQuizScore(questions: ScoringQuestion[], answers: { questionId: number; optionId: number }[], passingPercentage: number) {
  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer.optionId]));
  let totalPoints = 0;
  let earnedPoints = 0;
  for (const question of questions) {
    totalPoints += question.points;
    const selectedOption = question.options.find((option) => option.id === answerMap.get(question.id));
    if (selectedOption?.isCorrect) earnedPoints += question.points;
  }
  const scorePercentage = totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 10000) / 100;
  return { scorePercentage, passed: scorePercentage >= passingPercentage, totalPoints, earnedPoints };
}

export async function createQuiz(userId: number, courseId: number, input: { title: string; description?: string | null; passingPercentage?: number }) {
  await requireApprovedInstructor(userId);
  await ownedEditableCourse(courseId, userId);
  return Quiz.create({ courseId, title: input.title, description: input.description ?? null, passingPercentage: input.passingPercentage ?? 70, isPublished: false });
}

export async function addQuestion(userId: number, quizId: number, input: { questionText: string; position: number; points?: number; options: { optionText: string; position: number; isCorrect: boolean }[] }) {
  await requireApprovedInstructor(userId);
  const quiz = await ownedQuiz(quizId, userId);
  return sequelize.transaction(async (transaction) => {
    const question = await QuizQuestion.create({ quizId, questionText: input.questionText, position: input.position, points: input.points ?? 1 }, { transaction });
    await QuizOption.bulkCreate(input.options.map((option) => ({ ...option, questionId: question.id })), { transaction });
    await quiz.update({ isPublished: false }, { transaction });
    return QuizQuestion.findByPk(question.id, { include: [{ association: 'options', separate: true, order: [['position', 'ASC']] }], transaction });
  });
}

export async function updateQuiz(userId: number, quizId: number, input: Partial<{ title: string; description: string | null; passingPercentage: number }>) {
  await requireApprovedInstructor(userId);
  const quiz = await ownedQuiz(quizId, userId);
  return quiz.update(input);
}

export async function deleteQuiz(userId: number, quizId: number) {
  await requireApprovedInstructor(userId);
  const quiz = await ownedQuiz(quizId, userId);
  await quiz.destroy();
}

export async function updateQuestion(userId: number, questionId: number, input: Partial<{ questionText: string; position: number; points: number; options: { optionText: string; position: number; isCorrect: boolean }[] }>) {
  await requireApprovedInstructor(userId);
  const question = await QuizQuestion.findByPk(questionId);
  if (!question) throw new AppError(404, 'Question not found', 'QUESTION_NOT_FOUND');
  const quiz = await ownedQuiz(question.quizId, userId);
  return sequelize.transaction(async (transaction) => {
    const { options, ...details } = input;
    await question.update(details, { transaction });
    if (options) {
      await QuizOption.destroy({ where: { questionId }, transaction });
      await QuizOption.bulkCreate(options.map((option) => ({ ...option, questionId })), { transaction });
    }
    await quiz.update({ isPublished: false }, { transaction });
    return QuizQuestion.findByPk(questionId, { include: [{ association: 'options', separate: true, order: [['position', 'ASC']] }], transaction });
  });
}

export async function deleteQuestion(userId: number, questionId: number) {
  await requireApprovedInstructor(userId);
  const question = await QuizQuestion.findByPk(questionId);
  if (!question) throw new AppError(404, 'Question not found', 'QUESTION_NOT_FOUND');
  const quiz = await ownedQuiz(question.quizId, userId);
  await sequelize.transaction(async (transaction) => {
    await question.destroy({ transaction });
    await quiz.update({ isPublished: false }, { transaction });
  });
}

export async function publishQuiz(userId: number, quizId: number) {
  await requireApprovedInstructor(userId);
  const quiz = await ownedQuiz(quizId, userId);
  const questionCount = await QuizQuestion.count({ where: { quizId } });
  if (questionCount === 0) throw new AppError(400, 'A quiz must have at least one question', 'QUIZ_EMPTY');
  await quiz.update({ isPublished: true });
  return quiz;
}

export async function getQuizForStudent(studentId: number, quizId: number) {
  const quiz = await Quiz.findOne({ where: { id: quizId, isPublished: true }, include: [{ association: 'course' }, quizQuestionsInclude()] });
  const course = quiz?.get('course') as Course | undefined;
  if (!quiz || !course || course.status !== CourseStatus.PUBLISHED) throw new AppError(404, 'Published quiz not found', 'QUIZ_NOT_FOUND');
  await requireCourseEnrollment(studentId, course.id);
  return quiz;
}

export async function submitQuiz(studentId: number, quizId: number, answers: { questionId: number; optionId: number }[]) {
  const quiz = await Quiz.findOne({ where: { id: quizId, isPublished: true }, include: [{ association: 'course' }, quizQuestionsInclude(true)] });
  const course = quiz?.get('course') as Course | undefined;
  if (!quiz || !course || course.status !== CourseStatus.PUBLISHED) throw new AppError(404, 'Published quiz not found', 'QUIZ_NOT_FOUND');
  await requireCourseEnrollment(studentId, course.id);
  const questions = quiz.get('questions') as QuizQuestion[];
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const seenQuestionIds = new Set<number>();
  for (const answer of answers) {
    if (seenQuestionIds.has(answer.questionId)) throw new AppError(400, 'Each quiz question may be answered only once', 'DUPLICATE_QUIZ_ANSWER');
    const question = questionMap.get(answer.questionId);
    const options = question?.get('options') as QuizOption[] | undefined;
    if (!question || !options?.some((option) => option.id === answer.optionId)) throw new AppError(400, 'Quiz answer does not belong to this quiz', 'INVALID_QUIZ_ANSWER');
    seenQuestionIds.add(answer.questionId);
  }
  const score = calculateQuizScore(questions.map((question) => ({ id: question.id, points: question.points, options: question.get('options') as QuizOption[] })), answers, Number(quiz.passingPercentage));
  const { scorePercentage, passed, totalPoints, earnedPoints } = score;
  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer.optionId]));
  return sequelize.transaction(async (transaction) => {
    const attempt = await QuizAttempt.create({ quizId, studentId, scorePercentage, passed, answers: Object.fromEntries(answerMap), submittedAt: new Date() }, { transaction });
    await createNotification({ userId: studentId, type: NotificationType.QUIZ, title: passed ? 'Quiz passed' : 'Quiz submitted', message: `You scored ${scorePercentage}% on ${quiz.title}.` }, { transaction });
    return { attempt, scorePercentage, passed, totalPoints, earnedPoints };
  });
}

export async function getStudentAttempt(studentId: number, attemptId: number) {
  const attempt = await QuizAttempt.findOne({ where: { id: attemptId, studentId }, include: [{ model: Quiz, as: 'quiz', attributes: ['id', 'title', 'courseId'] }] });
  if (!attempt) throw new AppError(404, 'Quiz attempt not found', 'QUIZ_ATTEMPT_NOT_FOUND');
  return attempt;
}

export const parseQuizId = (value: string) => requireResourceId(value, 'quiz');
export const parseAttemptId = (value: string) => requireResourceId(value, 'attempt');
