import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FavoritesPage from '@/pages/FavoritesPage';
import SettingsPage from '@/pages/SettingsPage';
import { renderWithProviders } from '@/test/renderWithProviders';
import { makeItem } from '@/test/factories';

vi.mock('@/lib/firebase', () => ({ auth: {} }));
vi.mock('firebase/auth', () => ({ updateProfile: vi.fn() }));

describe('FavoritesPage', () => {
  it('shows an empty state with no favorites', () => {
    renderWithProviders(<FavoritesPage />);
    expect(screen.getByText('No favorites yet')).toBeInTheDocument();
  });

  it('lists saved items and their count', () => {
    renderWithProviders(<FavoritesPage />, {
      favorites: {
        items: [makeItem({ id: 'a', title: 'Saved one' }), makeItem({ id: 'b', title: 'Saved two' })],
      },
    });
    expect(screen.getByText('2 saved items')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Saved one' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Saved two' })).toBeInTheDocument();
  });
});

describe('SettingsPage', () => {
  it('adds a category to the store when clicked', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<SettingsPage />, {
      preferences: { darkMode: false, categories: ['technology'] },
    });

    await user.click(screen.getByRole('button', { name: 'Science' }));
    expect(store.getState().preferences.categories).toEqual(['technology', 'science']);
  });

  it('never allows the last category to be removed', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<SettingsPage />, {
      preferences: { darkMode: false, categories: ['technology'] },
    });

    const tech = screen.getByRole('button', { name: 'Technology' });
    await user.click(tech);

    expect(store.getState().preferences.categories).toEqual(['technology']);
    expect(tech).toHaveAttribute('aria-pressed', 'true');
  });
});