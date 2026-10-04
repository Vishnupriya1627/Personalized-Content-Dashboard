import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import read, { markRead, toggleRead, clearRead } from '@/features/read/readSlice';
import ContentCard from '@/components/cards/ContentCard';
import ReadPage from '@/pages/ReadPage';
import { renderWithProviders } from '@/test/renderWithProviders';
import { makeItem } from '@/test/factories';

const a = makeItem({ id: 'a', title: 'Story A' });
const b = makeItem({ id: 'b', title: 'Story B' });

describe('readSlice', () => {
  it('puts the most recently read item first', () => {
    let state = read(undefined, markRead(a));
    state = read(state, markRead(b));
    expect(state.items.map((i) => i.id)).toEqual(['b', 'a']);
  });

  it('markRead never duplicates or un-marks', () => {
    let state = read(undefined, markRead(a));
    state = read(state, markRead(a));
    expect(state.items).toHaveLength(1);
  });

  it('toggleRead adds, then removes', () => {
    let state = read(undefined, toggleRead(a));
    expect(state.items).toHaveLength(1);
    state = read(state, toggleRead(a));
    expect(state.items).toHaveLength(0);
  });

  it('keeps at most 200 items', () => {
    let state = read(undefined, { type: 'init' });
    for (let i = 0; i < 205; i++) state = read(state, markRead(makeItem({ id: `x${i}` })));
    expect(state.items).toHaveLength(200);
    expect(state.items[0].id).toBe('x204');
  });

  it('clears everything', () => {
    const state = read(read(undefined, markRead(a)), clearRead());
    expect(state.items).toEqual([]);
  });
});

describe('read button on ContentCard', () => {
  it('toggles the read state and updates the store', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<ContentCard item={a} />);

    const mark = screen.getByRole('button', { name: 'Mark Story A as read' });
    expect(mark).toHaveAttribute('aria-pressed', 'false');
    await user.click(mark);
    expect(store.getState().read.items).toHaveLength(1);

    const unmark = screen.getByRole('button', { name: 'Mark Story A as unread' });
    expect(unmark).toHaveAttribute('aria-pressed', 'true');
    await user.click(unmark);
    expect(store.getState().read.items).toHaveLength(0);
  });
});

describe('ReadPage', () => {
  it('shows an empty state when nothing has been read', () => {
    renderWithProviders(<ReadPage />);
    expect(screen.getByText('Nothing read yet')).toBeInTheDocument();
  });

  it('lists read items and clears them all', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<ReadPage />, { read: { items: [a, b] } });

    expect(screen.getByText('2 items you\'ve read')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Story A' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(store.getState().read.items).toEqual([]);
    expect(screen.getByText('Nothing read yet')).toBeInTheDocument();
  });
});