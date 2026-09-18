# SkillForge Frontend API Mapping

Base URL: `VITE_API_URL` (default `http://localhost:4000/api`)

All successful responses use `{ success: true, message, data }`. Errors use `{ success: false, message, error: { code, details? } }`. Authenticated requests send `Authorization: Bearer <accessToken>`.

## Authentication

| Frontend operation | Method | Endpoint | Auth | Request / response data |
| --- | --- | --- | --- | --- |
| Register | POST | `/auth/register` | Public | Body: `firstName`, `lastName`, `email`, `password`, `role` (`student` or `instructor`). Returns `{ user, accessToken }`. |
| Login | POST | `/auth/login` | Public | Body: `email`, `password`. Returns `{ user, accessToken }`. |
| Current user | GET | `/auth/me` | Bearer | Returns the authenticated public user. |

## Catalog

| Frontend operation | Method | Endpoint | Auth | Request / response data |
| --- | --- | --- | --- | --- |
| List categories | GET | `/categories` | Public | Returns active category array. |
| List courses | GET | `/courses?page&limit&search&categoryId&level` | Public | Returns `{ items, pagination }`. |
| Course details | GET | `/courses/:slug` | Public | Returns published course with nested modules and lessons. |
| Instructor courses | GET | `/courses/mine` | Instructor | Returns owned courses. |
| Create course | POST | `/courses` | Instructor | Body: `categoryId`, `title`, `slug`, `shortDescription`, `description`, optional `thumbnailUrl`, `level`. |
| Submit course | POST | `/courses/:id/submit` | Instructor | No body. Sets course to pending. |
| Pending courses | GET | `/courses/pending` | Admin | Returns pending courses. |
| Approve/reject course | POST | `/courses/:id/approve` or `/courses/:id/reject` | Admin | No body. |
| Course modules | GET | `/courses/:courseId/modules` | Public | Returns published modules with lessons. |
| Lesson list | GET | `/modules/:moduleId/lessons` | Public | Returns published module lessons. |

## Student learning

| Frontend operation | Method | Endpoint | Auth | Request / response data |
| --- | --- | --- | --- | --- |
| Enroll | POST | `/enrollments/courses/:courseId` | Student | No body. Returns the enrollment. Duplicate enrollment returns `409 DUPLICATE_ENROLLMENT`. |
| My enrollments | GET | `/enrollments/mine` | Student | Returns enrollment array with course. |
| Enrollment detail | GET | `/enrollments/:id` | Student | Returns an owned enrollment with course. |
| Complete lesson | POST | `/lessons/:lessonId/complete` | Student | No body. Returns progress totals and a certificate when the course is complete. |
| Course progress | GET | `/enrollments/:enrollmentId/progress` | Student | Returns `{ totalLessons, completedLessons, percentage, progress }`. |
| Certificates | GET | `/certificates` | Student | Returns owned certificates. |
| Certificate detail | GET | `/certificates/:certificateNumber` | Student | Returns an owned certificate with course/enrollment. |
| Get quiz | GET | `/quizzes/:quizId` | Student | Returns published quiz questions/options without `isCorrect`. Requires course enrollment. |
| Submit quiz | POST | `/quizzes/:quizId/attempts` | Student | Body: `{ answers: [{ questionId, optionId }] }`. Returns backend score, pass status, and saved attempt. |
| Quiz attempt | GET | `/quiz-attempts/:id` | Student | Returns an owned attempt. |
| Create review | POST | `/courses/:courseId/reviews` | Student | Body: `rating` 1-5 and optional `comment`. Requires enrollment. |
| List reviews | GET | `/courses/:courseId/reviews` | Public | Returns reviews with public student names. |
| Notifications | GET | `/notifications` | Bearer | Returns current user's recent notifications. |
| Mark notification read | PATCH | `/notifications/:id/read` | Bearer | No body. Returns the updated notification. |

## Instructor and admin authoring

| Frontend operation | Method | Endpoint | Auth | Request / response data |
| --- | --- | --- | --- | --- |
| Create module | POST | `/courses/:courseId/modules` | Approved instructor | Body: `title`, `description`, `position`. |
| Edit/delete module | PATCH/DELETE | `/modules/:id` | Approved instructor | PATCH accepts partial module fields. |
| Create lesson | POST | `/modules/:moduleId/lessons` | Approved instructor | Body: `title`, `content`, optional `videoUrl`, `durationMinutes`, `position`, `isPreview`. |
| Edit/delete lesson | PATCH/DELETE | `/lessons/:id` | Approved instructor | PATCH accepts partial lesson fields. |
| Create quiz | POST | `/courses/:courseId/quizzes` | Approved instructor | Body: `title`, optional `description`, `passingPercentage`. |
| Add question | POST | `/quizzes/:quizId/questions` | Approved instructor | Body: `questionText`, `position`, optional `points`, `options` with exactly one `isCorrect`. |
| Publish quiz | POST | `/quizzes/:quizId/publish` | Approved instructor | No body. Requires at least one question. |
| Admin categories | POST/PATCH/DELETE | `/categories` and `/categories/:id` | Admin | Category management operations. |

## Frontend behavior rules

- Store only the returned JWT in browser storage; never store passwords or quiz answer keys.
- On `401`, clear the token and redirect to `/login`.
- Treat `403` as an authorization state and show an access-denied UI.
- Use the API's `pagination` object for course listing controls.
- Public course details can be viewed without auth; enrollment, progress, quizzes, certificates, and reviews require the mapped student routes.
