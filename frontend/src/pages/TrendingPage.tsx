import { useState } from 'react';
import { Newspaper, Film, MessageCircle } from 'lucide-react';
import PageTitle from '@/components/PageTitle';
import TrendingSection from '@/components/trending/TrendingSection';
import { useAppSelector } from '@/store/hooks';

type Filter = 'all' | 'news' | 'movies' | 'social';

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'news', label: 'News' },
  { id: 'movies', label: 'Movies' },
  { id: 'social', label: 'Posts' },
];

export default function TrendingPage() {
  const categories = useAppSelector((s) => s.preferences.categories);
  const [filter, setFilter] = useState<Filter>('all');

  const show = (type: Filter) => filter === 'all' || filter === type;

  return (
    <div className="space-y-8">
      <PageTitle title="Trending" subtitle="Top news, movies and posts right now." />

      <div role="group" aria-label="Filter trending content" className="flex flex-wrap gap-2">
        {filters.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            aria-pressed={filter === id}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand/40 ${
              filter === id
                ? 'border-accent bg-accent text-on-accent'
                : 'border-border bg-surface text-muted hover:text-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {show('news') && (
        <TrendingSection title="Trending news" icon={Newspaper} type="news" categories={categories} />
      )}
      {show('movies') && (
        <TrendingSection title="Top rated movies" icon={Film} type="movies" categories={categories} />
      )}
      {show('social') && (
        <TrendingSection title="Top posts" icon={MessageCircle} type="social" categories={categories} />
      )}
    </div>
  );
}