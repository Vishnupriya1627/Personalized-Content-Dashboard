import { describe, it, expect } from 'vitest';
import { interleave } from '@/lib/interleave';

describe('interleave', () => {
  it('alternates items from each list', () => {
    expect(interleave([1, 2], [10, 20], [100, 200])).toEqual([1, 10, 100, 2, 20, 200]);
  });

  it('keeps the leftovers when lists have different lengths', () => {
    expect(interleave([1, 2, 3], [10], [])).toEqual([1, 10, 2, 3]);
  });

  it('returns an empty array when everything is empty', () => {
    expect(interleave([], [])).toEqual([]);
    expect(interleave()).toEqual([]);
  });
});