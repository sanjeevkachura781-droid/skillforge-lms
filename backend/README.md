# SkillForge Backend

Phase 1 provides the ESM TypeScript Express foundation, Sequelize/MySQL connection, user and instructor-profile models, JWT authentication, bcrypt password hashing, Zod validation, role authorization, Helmet, CORS, authentication rate limiting, and centralized errors. Phase 2 adds migration-managed catalog data: categories, courses, course modules, and lessons. Phase 3 adds enrollments, lesson progress, quizzes, quiz attempts, certificates, reviews, and notifications.

## Local setup

```powershell
npm install
Copy-Item .env.example .env
npm run build
npm run dev
```

Set `DATABASE_URL` and a production-strength `JWT_SECRET` in `.env`. `npm run seed` creates local development demo accounts only; do not use those credentials outside development.

Run `npm run migrate` before `npm run seed`. Migrations are tracked in the `schema_migrations` table and are applied in order without using `sequelize.sync()`.

The API health check is available at `GET /health`. Authentication endpoints are `POST /api/auth/register`, `POST /api/auth/login`, and `GET /api/auth/me`.

## Phase 2 catalog endpoints

- `GET /api/categories` lists active categories. Admins can create, update, and deactivate categories.
- `GET /api/courses` lists published courses with pagination, search, category, and level filters.
- `GET /api/courses/:slug` retrieves a published course with modules and lessons.
- Approved instructors can create and edit draft/rejected courses, submit them for review, and manage nested modules and lessons.
- Admins can inspect pending courses and approve or reject them.

The catalog schema uses foreign keys and cascade rules: courses belong to users and categories, modules belong to courses, and lessons belong to modules. Course and lesson ordering is unique within its parent.

## Phase 3 learning endpoints

- Students can enroll with `POST /api/enrollments/courses/:courseId`; the database prevents duplicate student/course pairs.
- Students can complete lessons with `POST /api/lessons/:lessonId/complete` and inspect progress with `GET /api/enrollments/:enrollmentId/progress`.
- Completing every lesson marks the enrollment complete and creates one certificate plus a notification.
- Approved instructors create quizzes and questions; students retrieve published quizzes and submit attempts through `/api/quizzes/:quizId`.
- Quiz scoring, passing status, and attempt persistence are calculated on the backend. Correct options are never returned in student quiz payloads.
- Enrolled students can create one review per course with `POST /api/courses/:courseId/reviews`.
- Authenticated users can list and mark notifications read through `/api/notifications`.

The Phase 3 migration creates foreign keys and uniqueness constraints for enrollments, progress rows, quiz ordering, certificates, and reviews.
