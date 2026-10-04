import { describe, it, expect } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContentCard from '@/components/cards/ContentCard';
import { renderWithProviders } from '@/test/renderWithProviders';
import { makeItem } from '@/test/factories';

describe('ContentCard', () => {
  it('shows the title, source and a Read More link for news', () => {
    renderWithProviders(<ContentCard item={makeItem()} />);

    expect(screen.getByRole('heading', { name: 'Sample headline' })).toBeInTheDocument();
    expect(screen.getByText(/Example News/)).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /read more/i });
    expect(link).toHaveAttribute('href', 'https://example.com/article');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('uses a different call to action for movies and posts', () => {
    const { unmount } = renderWithProviders(<ContentCard item={makeItem({ type: 'movie' })} />);
    expect(screen.getByRole('link', { name: /view details/i })).toBeInTheDocument();
    unmount();

    renderWithProviders(<ContentCard item={makeItem({ type: 'social' })} />);
    expect(screen.getByRole('link', { name: /view post/i })).toBeInTheDocument();
  });

  it('hides the description when there is none', () => {
    renderWithProviders(<ContentCard item={makeItem({ description: '' })} />);
    expect(screen.queryByText('A short description')).not.toBeInTheDocument();
  });

  it('toggles the favorite button and updates the store', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<ContentCard item={makeItem()} />);

    const add = screen.getByRole('button', { name: /add sample headline to favorites/i });
    expect(add).toHaveAttribute('aria-pressed', 'false');

    await user.click(add);
    expect(store.getState().favorites.items).toHaveLength(1);

    const remove = screen.getByRole('button', { name: /remove sample headline from favorites/i });
    expect(remove).toHaveAttribute('aria-pressed', 'true');

    await user.click(remove);
    expect(store.getState().favorites.items).toHaveLength(0);
  });

  it('falls back to an icon when the image fails to load', () => {
    const { container } = renderWithProviders(
      <ContentCard item={makeItem({ image: 'https://example.com/broken.jpg' })} />
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();

    fireEvent.error(img!);
    expect(container.querySelector('img')).toBeNull();
  });
});