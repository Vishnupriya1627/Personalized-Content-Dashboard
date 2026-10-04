import type { ContentItem } from '@/types/content';

export function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'news-1',
    type: 'news',
    title: 'Sample headline',
    description: 'A short description',
    url: 'https://example.com/article',
    source: 'Example News',
    category: 'technology',
    publishedAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
  };
}