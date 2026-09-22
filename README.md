# SkillForge LMS

React / TypeScript frontend and Express / Sequelize / MySQL backend.

Implemented: student and instructor registration, instructor approval, course/module/lesson authoring, course review and publication, public previews, enrollment, lesson progress, quizzes, reviews, certificates, notifications, category management, and catalog search/filtering/pagination.

## Run locally

Install Node.js and MySQL 8. Configure `backend/.env` using `backend/.env.example`. Configure `frontend/.env` from its example if needed. Preserve existing environment files.

```powershell
npm --prefix backend install
npm --prefix frontend install
npm --prefix backend run migrate
npm --prefix backend run seed
npm run build
npm run dev
```

Open http://localhost:5173. The Windows launcher starts hidden processes and writes logs in the project root. It uses ports 4000/5173. For custom ports or source watching, run `npm run dev` separately in each application directory. Rebuild and restart the backend after source changes when using the root launcher.

## Local demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Student | student@skillforge.test | Student@12345 |
| Instructor | instructor@skillforge.test | Instructor@12345 |
| Admin | admin@skillforge.test | Admin@12345 |

These accounts are for local development only. Seeding preserves existing passwords and progress.

## Verification

```powershell
npm run lint
npm run build
npm test
npm run test:integration
npm run test:e2e
```

Integration checks use the configured MySQL database, create uniquely named temporary records, and clean those records up. Browser tests use seeded accounts and Microsoft Edge, start servers when needed, create/remove a temporary course and student, and add quiz attempts to the demo student. Build the backend first. See [TESTING.md](TESTING.md) for manual testing.

## Deployment

Build both applications. Run `npm --prefix backend start` for the API and serve `frontend/dist` with an SPA fallback to `index.html`. Set the frontend API URL at build time, configure CORS, and run migrations before starting the deployment. Set `NODE_ENV=production`, a unique random JWT secret of at least 32 characters, and the database URL. The backend rejects the default development secret in production. Use HTTPS and database backups. Do not run the development seed in production.

Certificates support browser printing / Save as PDF. Lesson videos open instructor-provided URLs. This scope does not include payments, email/password recovery, media uploads, or external certificate accreditation.
