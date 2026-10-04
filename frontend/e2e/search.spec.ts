import { test, expect } from '@playwright/test';
import { hasCreds, mockApis, login } from './helpers';

test.describe('search', () => {
  test.skip(!hasCreds, 'Set E2E_EMAIL and E2E_PASSWORD in .env.e2e.local');

  test.beforeEach(async ({ page }) => {
    await mockApis(page);
    await login(page);
  });

  test('filters the feed by title and restores it when cleared', async ({ page }) => {
    const search = page.getByLabel('Search news, movies and posts');
    const heading = (name: string) => page.getByRole('heading', { name, exact: true });

    await expect(heading('Quantum Chips Break Records')).toBeVisible();

    await search.fill('avengers');
    await expect(heading('The Avengers')).toBeVisible();
    await expect(heading('Quantum Chips Break Records')).toHaveCount(0);

    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(heading('Quantum Chips Break Records')).toBeVisible();
    await expect(heading('Inception')).toBeVisible();
  });

  test('is debounced: typing fast sends one request, not one per letter', async ({ page }) => {
  const terms = new Set<string>();
  page.on('request', (r) => {
    const url = new URL(r.url());
    if (url.pathname === '/api/news' && url.searchParams.has('q')) {
      terms.add(url.searchParams.get('q')!);
    }
  });

  const firstCall = page.waitForRequest((r) => r.url().includes('/api/news?q=avengers'));
  await page.getByLabel('Search news, movies and posts').pressSequentially('avengers', { delay: 50 });
  await firstCall;
  await page.waitForTimeout(800); 
  expect([...terms]).toEqual(['avengers']);
});

  test('shows an empty state when nothing matches', async ({ page }) => {
    await page.getByLabel('Search news, movies and posts').fill('zzzzqq');
    await expect(page.getByText('No results')).toBeVisible();
  });
});