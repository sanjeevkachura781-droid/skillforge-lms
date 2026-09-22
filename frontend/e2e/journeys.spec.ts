import { execFileSync } from 'node:child_process';
import { test, expect, type Page } from '@playwright/test';
async function login(page: Page, role: string, password: string) { await page.goto('/login'); await page.getByLabel('Email', { exact: true }).fill(`${role}@skillforge.test`); await page.getByLabel('Password', { exact: true }).fill(password); await page.getByRole('button', { name: 'Sign in', exact: true }).click(); await expect(page).toHaveURL(/dashboard/); }
test('student reads lessons, takes quiz, and visits certificates', async ({ page }) => {
  await login(page, 'student', 'Student@12345');
  await page.getByRole('link', { name: /TypeScript API Foundations/ }).click();
  await expect(page.getByText('Keep controllers thin and business rules testable.')).toBeVisible();
  await page.getByRole('link', { name: /Take quiz:/ }).click();
  await page.getByLabel('The request boundary').check();
  await page.getByRole('button', { name: 'Submit answers' }).click();
  await expect(page.getByText(/Passed: 100%/)).toBeVisible();
  await page.goto('/certificates'); await expect(page.getByRole('heading', { name: 'Certificates', exact: true })).toBeVisible();
});
test('instructor opens working course creation form', async ({ page }) => {
  await login(page, 'instructor', 'Instructor@12345'); await page.getByRole('link', { name: 'New course' }).click();
  await expect(page.getByLabel('Course title (at least 3 characters)')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create course', exact: true })).toBeVisible();
});
test('admin manages applications and categories', async ({ page }) => {
  await login(page, 'admin', 'Admin@12345'); await page.getByRole('link', { name: 'Manage instructors and categories' }).click();
  await expect(page.getByRole('heading', { name: 'Instructor applications' })).toBeVisible();
  await expect(page.getByLabel('New category name')).toBeVisible();
});
test('mobile catalog and public previews work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/courses');
  await expect(page.getByRole('navigation', { name: 'Catalog pages' })).toBeVisible();
  await page.locator('article').filter({ has: page.getByRole('heading', { name: 'TypeScript API Foundations' }) }).getByRole('link', { name: 'View course' }).click();
  await page.getByText('Read preview', { exact: true }).click();
  await expect(page.getByText('Learn why every boundary should validate incoming data.')).toBeVisible();
  await expect(page.getByText('Keep controllers thin and business rules testable.')).toHaveCount(0);
});

test('author creates course, admin approves, new student enrolls and earns certificate', async ({ page }) => {
  const tag = `browser-${Date.now()}`; let courseId = 0;
  try {
    await login(page, 'instructor', 'Instructor@12345');
    await page.getByRole('link', { name: 'New course' }).click();
    await page.getByLabel('Course title (at least 3 characters)').fill(tag);
    await page.getByLabel('Summary (at least 10 characters)').fill('Browser workflow verification course');
    await page.getByLabel('Description (at least 20 characters)').fill('A complete course created through the browser for verification.');
    await page.getByRole('button', { name: 'Create course', exact: true }).click();
    await expect(page).toHaveURL(/instructor\/courses\/\d+$/);
    courseId = Number(page.url().split('/').pop());
    await page.getByLabel('Module title', { exact: true }).fill('Browser module');
    await page.getByRole('button', { name: 'Add module', exact: true }).click();
    await expect(page.getByText('Browser module', { exact: true })).toBeVisible();
    await page.locator('summary').filter({ hasText: /^Add lesson$/ }).click();
    await page.getByLabel('Lesson title', { exact: true }).fill('Browser lesson');
    await page.getByLabel('Lesson content', { exact: true }).fill('Read this private lesson to complete your learning.');
    await page.getByRole('button', { name: 'Add lesson', exact: true }).click();
    await expect(page.locator('summary').filter({ hasText: /^Browser lesson$/ })).toBeVisible();
    await page.getByRole('button', { name: 'Submit for admin review' }).click();
    await expect(page.getByText('Status: pending', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Log out' }).click();
    await login(page, 'admin', 'Admin@12345');
    const row = page.locator('div').filter({ has: page.getByRole('link', { name: `${tag} - inspect content` }) }).filter({ has: page.getByRole('button', { name: 'Approve', exact: true }) }).last();
    await row.getByRole('button', { name: 'Approve', exact: true }).click();
    await expect(page.getByRole('link', { name: `${tag} - inspect content` })).toHaveCount(0);
    await page.getByRole('button', { name: 'Log out' }).click();
    await page.goto('/register');
    await page.getByLabel('First name').fill('Browser'); await page.getByLabel('Last name').fill('Student');
    await page.getByLabel('Email', { exact: true }).fill(`${tag}@example.test`); await page.getByLabel('Password', { exact: true }).fill('Browser@12345');
    await page.getByRole('button', { name: 'Create account', exact: true }).click();
    await expect(page).toHaveURL(/dashboard/); await page.goto(`/courses/${tag}`);
    await page.getByRole('button', { name: 'Enroll in course' }).click(); await page.getByRole('link', { name: 'Go to my learning' }).click();
    await page.getByRole('link', { name: new RegExp(tag) }).click();
    await expect(page.getByText('Read this private lesson to complete your learning.')).toBeVisible();
    await page.getByRole('button', { name: 'Mark complete' }).click(); await expect(page.getByText('100%', { exact: true })).toBeVisible();
    await page.goto('/certificates'); await expect(page.getByRole('heading', { name: tag, exact: true })).toBeVisible();
  } finally {
    execFileSync(process.execPath, ['--input-type=module', '-e', `import {Course,User} from './dist/database/models/index.js'; import {sequelize} from './dist/database/sequelize.js'; try { if (Number(process.argv[1])) await Course.destroy({where:{id:Number(process.argv[1])}}); await User.destroy({where:{email:process.argv[2]}}); } finally { await sequelize.close(); }`, String(courseId), `${tag}@example.test`], { cwd: '../backend' });
  }
});
