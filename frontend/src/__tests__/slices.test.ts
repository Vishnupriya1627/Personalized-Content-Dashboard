import { describe, it, expect } from 'vitest';
import preferences, { setCategories, toggleDarkMode } from '@/features/preferences/preferencesSlice';
import favorites, { toggleFavorite } from '@/features/favorites/favoritesSlice';
import feed, { setOrder, resetOrder } from '@/features/feed/feedSlice';
import search, { setSearchQuery } from '@/features/search/searchSlice';
import { makeItem } from '@/test/factories';

describe('preferencesSlice', () => {
  it('starts with technology and sports selected', () => {
    const state = preferences(undefined, { type: 'init' });
    expect(state.categories).toEqual(['technology', 'sports']);
  });

  it('replaces the categories', () => {
    const state = preferences(undefined, setCategories(['science']));
    expect(state.categories).toEqual(['science']);
  });

  it('toggles dark mode on and off', () => {
    const start = { darkMode: false, categories: ['technology'] };
    const on = preferences(start, toggleDarkMode());
    expect(on.darkMode).toBe(true);
    expect(preferences(on, toggleDarkMode()).darkMode).toBe(false);
  });
});

describe('favoritesSlice', () => {
  const a = makeItem({ id: 'a', title: 'A' });
  const b = makeItem({ id: 'b', title: 'B' });

  it('adds an item', () => {
    const state = favorites(undefined, toggleFavorite(a));
    expect(state.items).toEqual([a]);
  });

  it('puts the newest favorite first', () => {
    let state = favorites(undefined, toggleFavorite(a));
    state = favorites(state, toggleFavorite(b));
    expect(state.items.map((i) => i.id)).toEqual(['b', 'a']);
  });

  it('removes an item when toggled twice, leaving others alone', () => {
    let state = favorites(undefined, toggleFavorite(a));
    state = favorites(state, toggleFavorite(b));
    state = favorites(state, toggleFavorite(a));
    expect(state.items.map((i) => i.id)).toEqual(['b']);
  });
});

describe('feedSlice', () => {
  it('stores and resets the custom order', () => {
    const ordered = feed(undefined, setOrder(['x', 'y']));
    expect(ordered.order).toEqual(['x', 'y']);
    expect(feed(ordered, resetOrder()).order).toEqual([]);
  });
});

describe('searchSlice', () => {
  it('stores the query', () => {
    expect(search(undefined, setSearchQuery('batman')).query).toBe('batman');
  });
});