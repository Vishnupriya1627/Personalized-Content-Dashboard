import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LivePill from '@/components/feed/LivePill';
import { renderWithProviders } from '@/test/renderWithProviders';
import { makeItem } from '@/test/factories';

const tech = makeItem({ id: 'live-1', category: 'technology' });
const sports = makeItem({ id: 'live-2', category: 'sports' });

const stateWith = (pending: ReturnType<typeof makeItem>[]) => ({
  preferences: { darkMode: false, categories: ['technology'] },
  live: { status: 'live' as const, pending, revealed: [] },
});

describe('LivePill', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it('shows nothing when no live items are waiting', () => {
    renderWithProviders(<LivePill />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('counts only items in the user categories', () => {
    renderWithProviders(<LivePill />, stateWith([tech, sports]));
    expect(screen.getByRole('button', { name: /1 new item$/ })).toBeInTheDocument();
  });

  it('reveals the queued items and scrolls to the top when clicked', async () => {
    const { store } = renderWithProviders(<LivePill />, stateWith([tech]));

    await userEvent.setup().click(screen.getByRole('button', { name: /1 new item/ }));

    expect(store.getState().live.pending).toEqual([]);
    expect(store.getState().live.revealed.map((i) => i.id)).toEqual(['live-1']);
    expect(window.scrollTo).toHaveBeenCalled();
  });
});