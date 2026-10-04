import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Feed from '@/components/feed/Feed';
import { useGetFeedQuery } from '@/features/api/contentApi';
import { renderWithProviders } from '@/test/renderWithProviders';
import { makeItem } from '@/test/factories';

// Replace the real network hook with a fake we control
vi.mock('@/features/api/contentApi', () => ({ useGetFeedQuery: vi.fn() }));
const mockedQuery = vi.mocked(useGetFeedQuery);

function mockFeed(overrides: Record<string, unknown> = {}) {
  mockedQuery.mockReturnValue({
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  } as never);
}

const items = [
  makeItem({ id: 'n1', title: 'First story' }),
  makeItem({ id: 'm1', type: 'movie', title: 'Great Movie' }),
  makeItem({ id: 's1', type: 'social', title: '@someone' }),
];

describe('Feed', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows skeleton placeholders while loading', () => {
    mockFeed({ isLoading: true });
    renderWithProviders(<Feed />);
    expect(screen.getByLabelText('Loading your feed')).toBeInTheDocument();
  });

  it('renders every item once data arrives', () => {
    mockFeed({ data: { items, page: 1, hasMore: false } });
    renderWithProviders(<Feed />);

    expect(screen.getByRole('heading', { name: 'First story' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Great Movie' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '@someone' })).toBeInTheDocument();
    expect(screen.getByText(/all caught up/i)).toBeInTheDocument();
  });

  it('shows an empty state when nothing matches the preferences', () => {
    mockFeed({ data: { items: [], page: 1, hasMore: false } });
    renderWithProviders(<Feed />);
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });

  it('shows an error state with a working retry button', async () => {
    const refetch = vi.fn();
    mockFeed({ isError: true, refetch });
    renderWithProviders(<Feed />);

    expect(screen.getByText("Couldn't load your feed")).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('keeps the loaded items visible when loading more fails', () => {
    mockFeed({ isError: true, data: { items, page: 2, hasMore: true } });
    renderWithProviders(<Feed />);

    expect(screen.getByRole('heading', { name: 'First story' })).toBeInTheDocument();
    expect(screen.getByText("Couldn't load more content.")).toBeInTheDocument();
  });

  it('shows a spinner while the next page loads', () => {
    mockFeed({ isFetching: true, data: { items, page: 1, hasMore: true } });
    renderWithProviders(<Feed />);
    expect(screen.getByRole('status', { name: 'Loading more' })).toBeInTheDocument();
  });

  it('shows the Reset order button only after the user has reordered', () => {
    mockFeed({ data: { items, page: 1, hasMore: false } });
    const { unmount } = renderWithProviders(<Feed />);
    expect(screen.queryByRole('button', { name: 'Reset order' })).not.toBeInTheDocument();
    unmount();

    renderWithProviders(<Feed />, { feed: { order: ['m1', 'n1', 's1'] } });
    expect(screen.getByRole('button', { name: 'Reset order' })).toBeInTheDocument();
  });
});