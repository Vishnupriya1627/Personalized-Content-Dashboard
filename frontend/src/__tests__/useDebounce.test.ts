import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('a', 400));
    expect(result.current).toBe('a');
  });

  it('updates only after the delay has passed', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 400), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'ab' });

    act(() => vi.advanceTimersByTime(399));
    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('ab');
  });

  it('restarts the timer when the value changes again', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 400), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'ab' });
    act(() => vi.advanceTimersByTime(300));
    rerender({ v: 'abc' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('a'); 

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('abc');
  });
});