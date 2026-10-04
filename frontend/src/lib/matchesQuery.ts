import type { ContentItem } from '@/types/content';

export function matchesQuery(item: ContentItem, q: string): boolean {
  const haystack = `${item.title} ${item.description} ${item.source} ${item.category ?? ''}`.toLowerCase();
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.every((w) => haystack.includes(w));
}