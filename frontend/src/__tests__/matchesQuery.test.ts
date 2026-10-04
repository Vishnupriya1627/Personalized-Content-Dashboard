import { describe, it, expect } from 'vitest';
import { matchesQuery } from '@/lib/matchesQuery';
import { makeItem } from '@/test/factories';

describe('matchesQuery', () => {
  const item = makeItem({
    title: 'The Avengers',
    description: 'Earth mightiest heroes fight Loki',
    source: 'OMDb',
    category: 'entertainment',
  });

  it('matches the title, ignoring case', () => {
    expect(matchesQuery(item, 'avengers')).toBe(true);
    expect(matchesQuery(item, 'AVENG')).toBe(true);
  });

  it('matches the description, source and category', () => {
    expect(matchesQuery(item, 'loki')).toBe(true);
    expect(matchesQuery(item, 'omdb')).toBe(true);
    expect(matchesQuery(item, 'entertainment')).toBe(true);
  });

  it('requires every word to match somewhere', () => {
    expect(matchesQuery(item, 'avengers loki')).toBe(true);
    expect(matchesQuery(item, 'avengers batman')).toBe(false);
  });

  it('does not match an empty or blank query', () => {
    expect(matchesQuery(item, '')).toBe(false);
    expect(matchesQuery(item, '   ')).toBe(false);
  });

  it('handles items with no category', () => {
    expect(matchesQuery(makeItem({ category: undefined }), 'headline')).toBe(true);
  });
});