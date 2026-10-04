import { test, expect } from '@playwright/test';
import { hasCreds, mockApis, login } from './helpers';

test.describe('authentication', () => {
  test('redirects visitors who are not logged in to the login page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  test('shows an error for a wrong password', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('nobody@example.com');
    await page.getByLabel('Password').fill('wrong-password-123');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();

    await expect(page.getByRole('alert')).toContainText('Incorrect email or password');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('logs in, stays logged in after reload, and signs out', async ({ page }) => {
    test.skip(!hasCreds, 'Set E2E_EMAIL and E2E_PASSWORD in .env.e2e.local');
    await mockApis(page);
    await login(page);

    await page.reload();
    await expect(page).toHaveURL('/');

    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});