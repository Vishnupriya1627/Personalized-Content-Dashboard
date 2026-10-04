import { expect, type Page } from '@playwright/test';

export const hasCreds = Boolean(process.env.E2E_EMAIL && process.env.E2E_PASSWORD);

const base = { description: 'Test description', publishedAt: '2026-10-01T10:00:00.000Z', source: 'Test' };

const DATA: Record<string, unknown[]> = {
  news: [
    { ...base, id: 'news-1', type: 'news', title: 'Quantum Chips Break Records', url: 'https://example.com/1' },
    { ...base, id: 'news-2', type: 'news', title: 'Markets Rally On Rate News', url: 'https://example.com/2' },
  ],
  movies: [
    { ...base, id: 'movie-1', type: 'movie', title: 'The Avengers', url: 'https://example.com/3' },
    { ...base, id: 'movie-2', type: 'movie', title: 'Inception', url: 'https://example.com/4' },
  ],
  social: [
    { ...base, id: 'social-1', type: 'social', title: '@devdaily', url: 'https://example.com/5' },
    { ...base, id: 'social-2', type: 'social', title: '@filmbuff', url: 'https://example.com/6' },
  ],
};

/** Replaces the backend with fixed data. Supports ?q= search and returns nothing after page 1. */
export async function mockApis(page: Page) {
  await page.route(/\/api\/(news|movies|social)(\?|$)/, async (route) => {
    const url = new URL(route.request().url());
    const kind = url.pathname.split('/').pop()!;
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    const pageNo = Number(url.searchParams.get('page') ?? 1);

    let items = DATA[kind] as { title: string }[];
    if (q) items = items.filter((i) => i.title.toLowerCase().includes(q));
    if (pageNo > 1) items = [];

    await route.fulfill({ json: { items, page: pageNo } });
  });
}

export async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL('/');
}