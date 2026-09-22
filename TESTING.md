# Test SkillForge yourself

Run `npm run build` then `npm run dev` from the project root. Open http://localhost:5173. Use the accounts in README.md. Log out between roles or use separate browser profiles.

## Student learning

1. Sign in as the demo student and open TypeScript API Foundations.
2. Read both lessons and mark each complete. Expect 100% progress.
3. Open the quiz, select "The request boundary", and submit. Expect 100% and Passed.
4. Post a review. A second review should display a duplicate-review error.
5. Open Certificates and print/save the certificate as PDF.
6. Open Notifications using the bell and mark one read.

Existing demo progress is preserved, so lessons may already be complete.

## Instructor approval

1. Register a new instructor with a unique email.
2. Confirm the pending status. Creating courses requires approval.
3. Sign in as admin, open Manage instructors and categories, and approve the application.
4. Sign back in as the new instructor.

## Author and publish

1. Click New course. Fill title, summary (10+ characters), description (20+ characters), category, and level.
2. Add a module and lesson content; optionally provide an HTTP/HTTPS video URL.
3. Add another lesson with a different position. Enable preview for just one lesson.
4. Edit a lesson. To delete it, check the explicit deletion checkbox.
5. Create a quiz, add at least one question with two options and one correct answer, and publish the quiz.
6. Submit the course. Empty courses/modules should be rejected. Pending courses are locked.
7. As admin, click the course title to inspect lesson content and quiz answers; approve or reject.
8. Rejected courses can be revised and resubmitted. Approved courses appear in the catalog.

## Enroll and finish

1. Log out and view the new course publicly. Read the preview. Private lesson bodies and video URLs must be absent from public API responses.
2. Register a student, enroll, and click Go to my learning.
3. Read lessons, take the quiz, complete lessons, and verify one certificate is issued.
4. Switch to another student account. Previous enrollments, certificates, and notifications must not appear.

## Catalog and administration

- Search and change level/category. Filters reset to page 1.
- With more than 24 matching courses, test Next and Previous.
- Create/edit/deactivate categories as admin. Inactive categories are unavailable for new courses.
- Test the mobile menu and narrow layouts.
- Stop the API temporarily to check request-error displays.

## Automated checks

- `npm test`: API foundation, frontend cache isolation, and quiz submission tests.
- `npm run test:integration`: MySQL lifecycle and permission tests using temporary records.
- `npm run test:e2e`: Edge student/instructor/admin/mobile checks and author-to-certificate journey. Failed runs retain traces in `frontend/test-results`.
