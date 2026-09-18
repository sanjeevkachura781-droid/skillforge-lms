const request = require('supertest');

let server;
let app;
let Course;
let CourseModule;
let Lesson;
let Enrollment;
let LessonProgress;
let Quiz;
let QuizQuestion;
let QuizOption;
let QuizAttempt;
let Certificate;
let Review;
let Notification;
let calculateQuizScore;

const validRegistration = {
  firstName: 'Test',
  lastName: 'Student',
  email: 'test.student@example.com',
  password: 'Password@123',
  role: 'student',
};

beforeAll(async () => {
  ({ app } = await import('../dist/app.js'));
  ({ Course, CourseModule, Lesson, Enrollment, LessonProgress, Quiz, QuizQuestion, QuizOption, QuizAttempt, Certificate, Review, Notification } = await import('../dist/database/models/index.js'));
  ({ calculateQuizScore } = await import('../dist/modules/quizzes/quiz.service.js'));
  server = app.listen(0);
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

describe('Phase 1 API foundation', () => {
  it('reports a healthy API', async () => {
    const response = await request(server).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true, data: { environment: expect.any(String) } });
  });

  it('rejects malformed registration before touching persistence', async () => {
    const response = await request(server).post('/api/auth/register').send({ ...validRegistration, password: 'short' });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ success: false, error: { code: 'VALIDATION_ERROR' } });
  });

  it('rejects protected requests without a token', async () => {
    const response = await request(server).get('/api/auth/me');
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ success: false, error: { code: 'AUTHENTICATION_REQUIRED' } });
  });

  it('rejects unknown routes consistently', async () => {
    const response = await request(server).get('/api/not-real');
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ success: false, error: { code: 'NOT_FOUND' } });
  });

  it('protects category administration from unauthenticated users', async () => {
    const response = await request(server).post('/api/categories').send({ name: 'Security', slug: 'security' });
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ success: false, error: { code: 'AUTHENTICATION_REQUIRED' } });
  });

  it('protects instructor course creation from unauthenticated users', async () => {
    const response = await request(server).post('/api/courses').send(validRegistration);
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ success: false, error: { code: 'AUTHENTICATION_REQUIRED' } });
  });

  it('protects enrollment, quiz attempts, reviews, and notifications', async () => {
    const endpoints = [
      ['post', '/api/enrollments/courses/1'],
      ['post', '/api/quizzes/1/attempts'],
      ['post', '/api/courses/1/reviews'],
      ['get', '/api/notifications'],
    ];
    for (const [method, path] of endpoints) {
      const response = await request(server)[method](path).send({});
      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({ success: false, error: { code: 'AUTHENTICATION_REQUIRED' } });
    }
  });

  it('calculates quiz scores on the backend', () => {
    const score = calculateQuizScore([
      { id: 1, points: 2, options: [{ id: 11, isCorrect: true }, { id: 12, isCorrect: false }] },
      { id: 2, points: 1, options: [{ id: 21, isCorrect: false }, { id: 22, isCorrect: true }] },
    ], [{ questionId: 1, optionId: 11 }, { questionId: 2, optionId: 21 }], 70);
    expect(score).toEqual({ scorePercentage: 66.67, passed: false, totalPoints: 3, earnedPoints: 2 });
  });

  it('registers the course, module, and lesson association graph', () => {
    expect(Course.associations.modules.target).toBe(CourseModule);
    expect(CourseModule.associations.course.target).toBe(Course);
    expect(CourseModule.associations.lessons.target).toBe(Lesson);
    expect(Lesson.associations.module.target).toBe(CourseModule);
    expect(Enrollment.associations.course.target).toBe(Course);
    expect(Enrollment.associations.lessonProgress.target).toBe(LessonProgress);
    expect(LessonProgress.associations.lesson.target).toBe(Lesson);
    expect(Quiz.associations.questions.target).toBe(QuizQuestion);
    expect(QuizQuestion.associations.options.target).toBe(QuizOption);
    expect(Quiz.associations.attempts.target).toBe(QuizAttempt);
    expect(Certificate.associations.enrollment.target).toBe(Enrollment);
    expect(Review.associations.course.target).toBe(Course);
    expect(Notification.associations.user).toBeDefined();
  });

  it('declares database uniqueness for duplicate enrollments and reviews', () => {
    const enrollmentIndex = Enrollment.options.indexes.find((index) => index.unique && index.fields.join(',') === 'student_id,course_id');
    const reviewIndex = Review.options.indexes.find((index) => index.unique && index.fields.join(',') === 'student_id,course_id');
    expect(enrollmentIndex).toBeDefined();
    expect(reviewIndex).toBeDefined();
  });
});
