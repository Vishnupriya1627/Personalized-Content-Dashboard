import { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  // Local state for now. Next step we'll debounce it and wire it to search.
  const [query, setQuery] = useState('');

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-bg/80 px-4 py-3 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="rounded-lg p-2 text-muted hover:bg-border lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div role="search" className="relative max-w-xl flex-1">
        <Search
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search news, movies and posts"
          placeholder="Search news, movies, posts…"
          className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-3 text-sm text-text placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}