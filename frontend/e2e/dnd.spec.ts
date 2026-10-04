import { test, expect } from '@playwright/test';
import { hasCreds, mockApis, login } from './helpers';

test.describe('drag-and-drop reordering', () => {
  test.skip(!hasCreds, 'Set E2E_EMAIL and E2E_PASSWORD in .env.e2e.local');

  test.beforeEach(async ({ page }) => {
    await mockApis(page);
    await login(page);
    await expect(page.locator('article h3').first()).toBeVisible();
  });

  test('reorders a card with the keyboard and keeps the order after reload', async ({ page }) => {
    const titles = page.locator('article h3');
    await expect(titles.nth(0)).toHaveText('Quantum Chips Break Records');
    await expect(titles.nth(1)).toHaveText('The Avengers');

    // Pick up the first card, move it one place right, drop it
    const handle = page.getByRole('button', { name: /^Reorder Quantum Chips Break Records/ });
    await handle.focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(150);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);
    await page.keyboard.press('Space');

    await expect(titles.nth(0)).toHaveText('The Avengers');
    await expect(titles.nth(1)).toHaveText('Quantum Chips Break Records');

    // The order is saved by redux-persist
    await page.reload();
    await expect(titles.nth(0)).toHaveText('The Avengers');

    // Reset brings back the default order
    await page.getByRole('button', { name: 'Reset order' }).click();
    await expect(titles.nth(0)).toHaveText('Quantum Chips Break Records');
  });
});