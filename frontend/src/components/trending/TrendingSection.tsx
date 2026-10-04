import type { LucideIcon } from 'lucide-react';
import { useGetTrendingQuery } from '@/features/api/contentApi';
import ContentCard from '@/components/cards/ContentCard';
import CardSkeleton from '@/components/cards/CardSkeleton';
import StateMessage from '@/components/cards/StateMessage';

interface Props {
  title: string;
  icon: LucideIcon;
  type: 'news' | 'movies' | 'social';
  categories: string[];
}

const gridClass = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3';

export default function TrendingSection({ title, icon: Icon, type, categories }: Props) {
  // Movies don't depend on categories, so don't let category changes refetch them
  const { data, isLoading, isError, refetch } = useGetTrendingQuery({
    type,
    categories: type === 'movies' ? [] : categories,
  });

  const headingId = `trending-${type}`;

  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <h2 id={headingId} className="flex items-center gap-2 text-lg font-semibold text-text">
        <Icon size={20} className="text-brand" aria-hidden="true" />
        {title}
      </h2>

      {isLoading && (
        <div className={gridClass} aria-busy="true" aria-label={`Loading ${title}`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && (
        <StateMessage
          title={`Couldn't load ${title.toLowerCase()}`}
          message="This source is unavailable right now."
          actionLabel="Try again"
          onAction={refetch}
        />
      )}

      {!isLoading && !isError && data?.length === 0 && (
        <StateMessage title="Nothing trending" message="No items to show here right now." />
      )}

      {data && data.length > 0 && (
        <ul className={gridClass}>
          {data.map((item, index) => (
            <li key={item.id} className="relative">
              {/* <span
                aria-label={`Rank ${index + 1}`}
                className="absolute -left-1 -top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-on-accent shadow"
              >
                {index + 1}
              </span> */}
              <ContentCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}