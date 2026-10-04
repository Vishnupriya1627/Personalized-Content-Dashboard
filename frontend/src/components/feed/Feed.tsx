import { useCallback, useState } from 'react';
import { useGetFeedQuery } from '@/features/api/contentApi';
import { useAppSelector } from '@/store/hooks';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import ContentCard from '@/components/cards/ContentCard';
import CardSkeleton from '@/components/cards/CardSkeleton';
import StateMessage from '@/components/cards/StateMessage';

const gridClass = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3';

export default function Feed() {
  const categories = useAppSelector((s) => s.preferences.categories);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, refetch } = useGetFeedQuery({ categories, page });

  const hasMore = data?.hasMore ?? false;
  const loadMore = useCallback(() => setPage((p) => p + 1), []);
  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !isFetching && !isError);

  if (isLoading) {
    return (
      <div className={gridClass} aria-busy="true" aria-label="Loading your feed">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError && !data) {
    return (
      <StateMessage
        title="Couldn't load your feed"
        message="Something went wrong while contacting the content servers."
        actionLabel="Try again"
        onAction={refetch}
      />
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <StateMessage
        title="Nothing here yet"
        message="No content matched your preferences. Try choosing different categories in Settings."
      />
    );
  }

  return (
    <>
      <ul className={gridClass}>
        {data.items.map((item) => (
          <li key={item.id}>
            <ContentCard item={item} />
          </li>
        ))}
      </ul>

      {hasMore && <div ref={sentinelRef} aria-hidden="true" className="h-4" />}

      {isFetching && (
        <div className="flex justify-center py-8" role="status" aria-label="Loading more">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        </div>
      )}

      {isError && (
        <div className="py-6 text-center">
          <p className="text-sm text-muted">Couldn't load more content.</p>
          <button onClick={refetch} className="mt-2 text-sm font-semibold text-brand hover:underline">
            Retry
          </button>
        </div>
      )}

      {!hasMore && !isFetching && (
        <p className="py-8 text-center text-sm text-muted">You're all caught up.</p>
      )}
    </>
  );
}