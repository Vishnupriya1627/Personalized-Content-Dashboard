import { useCallback, useMemo, useState } from 'react';
import { contentApi, useSearchContentQuery } from '@/features/api/contentApi';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useAppSelector } from '@/store/hooks';
import { matchesQuery } from '@/lib/matchesQuery';
import ContentCard from '@/components/cards/ContentCard';
import CardSkeleton from '@/components/cards/CardSkeleton';
import StateMessage from '@/components/cards/StateMessage';

const gridClass = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3';

export default function SearchResults({ q }: { q: string }) {
  const [page, setPage] = useState(1);
  const categories = useAppSelector((s) => s.preferences.categories);
  const favorites = useAppSelector((s) => s.favorites.items);

  // Items already loaded in the feed (the cache is shared across pages)
  const feedCache = contentApi.endpoints.getFeed.useQueryState({ categories, page: 1 });

  const { data, isLoading, isFetching, isError, refetch } = useSearchContentQuery({ q, page });

  const items = useMemo(() => {
    const local = [...(feedCache.data?.items ?? []), ...favorites].filter((i) => matchesQuery(i, q));
    const seen = new Set<string>();
    const merged = [];
    for (const item of [...local, ...(data?.items ?? [])]) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }
    return merged;
  }, [feedCache.data, favorites, data, q]);

  const hasMore = data?.hasMore ?? false;
  const loadMore = useCallback(() => setPage((p) => p + 1), []);
  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !isFetching && !isError);

  if (items.length === 0 && isLoading) {
    return (
      <div className={gridClass} aria-busy="true" aria-label="Searching">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0 && isError) {
    return (
      <StateMessage
        title="Search failed"
        message="Something went wrong while searching."
        actionLabel="Try again"
        onAction={refetch}
      />
    );
  }

  if (items.length === 0) {
    return <StateMessage title="No results" message={`Nothing matched "${q}". Try a different keyword.`} />;
  }

  return (
    <>
      <ul className={gridClass}>
        {items.map((item) => (
          <li key={item.id}>
            <ContentCard item={item} />
          </li>
        ))}
      </ul>

      {hasMore && <div ref={sentinelRef} aria-hidden="true" className="h-4" />}

      {isFetching && (
        <div className="flex justify-center py-8" role="status" aria-label="Searching more">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        </div>
      )}

      {!hasMore && !isFetching && (
        <p className="py-8 text-center text-sm text-muted">End of results.</p>
      )}
    </>
  );
}