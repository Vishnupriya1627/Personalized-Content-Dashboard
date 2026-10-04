import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import { useDebounce } from '@/hooks/useDebounce';
import { useAppDispatch } from '@/store/hooks';
import { setSearchQuery } from '@/features/search/searchSlice';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 400);

  // Debounced value updates the store; fewer than 2 characters means "no search"
  useEffect(() => {
    const term = debounced.trim();
    const next = term.length >= 2 ? term : '';
    dispatch(setSearchQuery(next));
    if (next && pathname !== '/') navigate('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // Leaving the feed clears the search
  useEffect(() => {
    if (pathname !== '/') {
      setQuery('');
      dispatch(setSearchQuery(''));
    }
  }, [pathname, dispatch]);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-bg/80 px-4 py-3 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="rounded-lg p-2 text-muted hover:bg-border lg:hidden"
      >
        <Menu size={20} />
      </button>

      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative max-w-xl flex-1">
        <Search
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search news, movies and posts"
          placeholder="Search news, movies, posts…"
          className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-9 text-sm text-text placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-text"
          >
            <X size={16} />
          </button>
        )}
      </form>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}