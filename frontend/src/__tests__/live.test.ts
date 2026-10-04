import { describe, it, expect } from 'vitest';
import live, { addLiveItem, revealPending, setStatus } from '@/features/live/liveSlice';
import feed, { prependToOrder } from '@/features/feed/feedSlice';
import { makeItem } from '@/test/factories';

describe('liveSlice', () => {
  const a = makeItem({ id: 'live-a' });
  const b = makeItem({ id: 'live-b' });

  it('starts in the connecting state with nothing queued', () => {
    const state = live(undefined, { type: 'init' });
    expect(state).toEqual({ status: 'connecting', pending: [], revealed: [] });
  });

  it('tracks the connection status', () => {
    expect(live(undefined, setStatus('live')).status).toBe('live');
  });

  it('queues the newest item first and ignores duplicates', () => {
    let state = live(undefined, addLiveItem(a));
    state = live(state, addLiveItem(b));
    state = live(state, addLiveItem(a));
    expect(state.pending.map((i) => i.id)).toEqual(['live-b', 'live-a']);
  });

  it('moves queued items to revealed, newest first, and clears the queue', () => {
    let state = live(undefined, addLiveItem(a));
    state = live(state, addLiveItem(b));
    state = live(state, revealPending());
    expect(state.pending).toEqual([]);
    expect(state.revealed.map((i) => i.id)).toEqual(['live-b', 'live-a']);
  });

  it('does not queue an item that was already revealed', () => {
    let state = live(undefined, addLiveItem(a));
    state = live(state, revealPending());
    state = live(state, addLiveItem(a));
    expect(state.pending).toEqual([]);
  });
});

describe('feedSlice prependToOrder', () => {
  it('does nothing when there is no custom order', () => {
    expect(feed({ order: [] }, prependToOrder(['x'])).order).toEqual([]);
  });

  it('puts new ids first and skips ones already in the order', () => {
    const state = feed({ order: ['a', 'b'] }, prependToOrder(['x', 'a']));
    expect(state.order).toEqual(['x', 'a', 'b']);
  });
});