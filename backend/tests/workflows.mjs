import assert from 'node:assert/strict';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../dist/app.js';
import { sequelize } from '../dist/database/sequelize.js';
import { User, Course, Category, Enrollment, InstructorProfile } from '../dist/database/models/index.js';

// Uses unique temporary records; removes only records created by this run.
const tag = `verify-${Date.now()}`;
const users = []; const courses = []; const categories = [];
let checks = 0;
function check(value, message) { assert.ok(value, message); checks++; }
async function call(method, path, token, body, status = 200) {
  let req = request(app)[method](`/api${path}`);
  if (token) req = req.set('Authorization', `Bearer ${token}`);
  if (body !== undefined) req = req.send(body);
  const result = await req;
  assert.equal(result.status, status, `${method} ${path}: ${JSON.stringify(result.body)}`); checks++;
  return result.body.data;
}
try {
  await sequelize.authenticate();
  const admin = await User.create({ firstName: 'Test', lastName: 'Admin', email: `${tag}-admin@example.test`, passwordHash: await bcrypt.hash('Verify@12345', 10), role: 'admin', status: 'active' }); users.push(admin.id);
  const adminLogin = await call('post', '/auth/login', null, { email: admin.email, password: 'Verify@12345' }); const a = adminLogin.accessToken;
  async function register(role, suffix) { const result = await call('post', '/auth/register', null, { firstName: 'Test', lastName: suffix, email: `${tag}-${suffix}@example.test`, password: 'Verify@12345', role }, 201); users.push(result.user.id); return result; }
  const teacher = await register('instructor', 'teacher'); const t = teacher.accessToken;
  const learner = await register('student', 'learner'); const s = learner.accessToken;
  const outsider = await register('student', 'outsider'); const o = outsider.accessToken;
  const category = await call('post', '/categories', a, { name: tag, slug: tag }, 201); categories.push(category.id);
  const description = '\u5b66'.repeat(30000);
  const body = { title: 'Workflow verification course', slug: tag, categoryId: category.id, shortDescription: 'A temporary course for workflow checks.', description, level: 'beginner' };
  await call('post', '/courses', t, body, 403);
  const profiles = await call('get', '/admin/instructors', a); const profile = profiles.find(p => p.userId === teacher.user.id);
  check(profile?.approvalStatus === 'pending', 'Instructor starts pending');
  await call('patch', `/admin/instructors/${profile.id}`, s, { approvalStatus: 'approved' }, 403);
  await call('patch', `/admin/instructors/${profile.id}`, a, { approvalStatus: 'approved' });
  const course = await call('post', '/courses', t, body, 201); courses.push(course.id);
  check(course.description === description, 'Large Unicode course description round-trips without truncation');
  await call('post', `/courses/${course.id}/submit`, t, {}, 400);
  const module = await call('post', `/courses/${course.id}/modules`, t, { title: 'First module', position: 1 }, 201);
  const lesson = await call('post', `/modules/${module.id}/lessons`, t, { title: 'Protected lesson', content: 'Private lesson content', videoUrl: 'https://example.com/lesson.mp4', position: 1, isPreview: false }, 201);
  const longContent = '\u5b66'.repeat(70000);
  const longLesson = await call('patch', `/lessons/${lesson.id}`, t, { content: longContent });
  check(longLesson.content === longContent, 'Large Unicode lesson content round-trips without truncation');
  const preview = await call('post', `/modules/${module.id}/lessons`, t, { title: 'Preview lesson', content: 'Public preview content', position: 2, isPreview: true }, 201);
  await call('patch', `/lessons/${lesson.id}`, t, { videoUrl: 'javascript:alert(1)' }, 400);
  const quiz = await call('post', `/courses/${course.id}/quizzes`, t, { title: 'Checkpoint' }, 201);
  await call('post', `/quizzes/${quiz.id}/publish`, t, {}, 400);
  await call('post', `/quizzes/${quiz.id}/questions`, t, { questionText: 'Choose the correct answer', position: 1, options: [{ optionText: 'Correct', position: 1, isCorrect: true }, { optionText: 'Incorrect', position: 2, isCorrect: false }] }, 201);
  await call('post', `/quizzes/${quiz.id}/publish`, t, {});
  await call('post', `/courses/${course.id}/submit`, t, {});
  await call('patch', `/lessons/${lesson.id}`, t, { content: 'Should be locked' }, 409);
  await call('post', `/courses/${course.id}/reject`, a, {});
  await call('patch', `/lessons/${lesson.id}`, t, { content: 'Private lesson content' });
  await call('post', `/courses/${course.id}/submit`, t, {});
  await call('get', `/instructor/courses/${course.id}`, a);
  await call('post', `/courses/${course.id}/approve`, a, {});
  const publicCourse = await call('get', `/courses/${tag}`);
  const publicLessons = publicCourse.modules.flatMap(m => m.lessons);
  check(!('content' in publicLessons.find(l => l.id === lesson.id)), 'Private content omitted');
  check(!('videoUrl' in publicLessons.find(l => l.id === lesson.id)), 'Private video omitted');
  check(publicLessons.find(l => l.id === preview.id).content === 'Public preview content', 'Preview visible');
  const lessonList = await call('get', `/modules/${module.id}/lessons`); check(!('content' in lessonList.find(l => l.id === lesson.id)), 'Lesson endpoint protects content');
  const modules = await call('get', `/courses/${course.id}/modules`); check(!('content' in modules[0].lessons.find(l => l.id === lesson.id)), 'Module endpoint protects content');
  await call('get', `/quizzes/${quiz.id}`, o, undefined, 403);
  const enrollment = await call('post', `/enrollments/courses/${course.id}`, s, {}, 201);
  await call('post', `/enrollments/courses/${course.id}`, s, {}, 409);
  const own = await call('get', '/enrollments/mine', s); check(own[0].course.modules[0].lessons.some(l => l.content === 'Private lesson content'), 'Enrolled student receives lesson content'); check(own[0].course.quizzes.some(q => q.id === quiz.id), 'Student can discover quiz');
  await call('get', `/enrollments/${enrollment.id}/progress`, o, undefined, 404);
  const studentQuiz = await call('get', `/quizzes/${quiz.id}`, s); const q = studentQuiz.questions[0];
  check(q.options.every(option => !('isCorrect' in option)), 'Quiz answers are not leaked');
  const answer = q.options.find(option => option.optionText === 'Correct');
  const result = await call('post', `/quizzes/${quiz.id}/attempts`, s, { answers: [{ questionId: q.id, optionId: answer.id }] }, 201); check(result.passed && result.scorePercentage === 100, 'Quiz is scored');
  await call('get', `/quiz-attempts/${result.attempt.id}`, o, undefined, 404);
  await call('post', `/courses/${course.id}/reviews`, s, { rating: 5, comment: 'Workflow verified' }, 201);
  await call('post', `/courses/${course.id}/reviews`, s, { rating: 4 }, 409);
  await call('post', `/lessons/${lesson.id}/complete`, o, {}, 403);
  await Promise.all([
    call('post', `/lessons/${lesson.id}/complete`, s, {}),
    call('post', `/lessons/${preview.id}/complete`, s, {}),
  ]);
  await call('post', `/lessons/${preview.id}/complete`, s, {});
  const progress = await call('get', `/enrollments/${enrollment.id}/progress`, s); check(progress.percentage === 100, 'Course complete');
  const certificates = await call('get', '/certificates', s); check(certificates.length === 1, 'Exactly one certificate');
  await call('get', `/certificates/${certificates[0].certificateNumber}`, o, undefined, 404);
  const notifications = await call('get', '/notifications', s); check(notifications.length >= 2, 'Notifications delivered');
  await call('patch', `/notifications/${notifications[0].id}/read`, o, {}, 404);
  await call('patch', `/notifications/${notifications[0].id}/read`, s, {});
  await Enrollment.update({ status: 'cancelled' }, { where: { id: enrollment.id } });
  const cancelledEnrollments = await call('get', '/enrollments/mine', s);
  check(cancelledEnrollments.every(item => item.id !== enrollment.id), 'Cancelled enrollments do not expose learning content');
  await call('get', `/enrollments/${enrollment.id}`, s, undefined, 404);
  await call('get', `/enrollments/${enrollment.id}/progress`, s, undefined, 404);
  await call('get', `/quizzes/${quiz.id}`, s, undefined, 403);
  await call('post', `/lessons/${lesson.id}/complete`, s, {}, 403);
  await User.update({ status: 'suspended' }, { where: { id: learner.user.id } });
  await call('get', '/enrollments/mine', s, undefined, 401);
  console.log(`PASS: ${checks} database-backed workflow and permission checks`);
} finally {
  if (courses.length) await Course.destroy({ where: { id: courses } });
  if (categories.length) await Category.destroy({ where: { id: categories } });
  if (users.length) { await InstructorProfile.destroy({ where: { userId: users } }); await User.destroy({ where: { id: users } }); }
  await sequelize.close();
}
