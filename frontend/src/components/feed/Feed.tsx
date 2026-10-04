import { useCallback, useMemo, useState } from 'react';
import { useGetFeedQuery } from '@/features/api/contentApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { resetOrder } from '@/features/feed/feedSlice';
import SortableFeed from '@/components/feed/SortableFeed';
import LivePill from '@/components/feed/LivePill';
import CardSkeleton from '@/components/cards/CardSkeleton';
import StateMessage from '@/components/cards/StateMessage';

const gridClass = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3';

export default function Feed() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((s) => s.preferences.categories);
  const hasCustomOrder = useAppSelector((s) => s.feed.order.length > 0);
  const revealed = useAppSelector((s) => s.live.revealed);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, refetch } = useGetFeedQuery({ categories, page });

  // Live items the user chose to show go on top, limited to their categories
  const items = useMemo(() => {
    if (!data) return [];
    const live = revealed.filter((i) => i.category && categories.includes(i.category));
    const liveIds = new Set(live.map((i) => i.id));
    return [...live, ...data.items.filter((i) => !liveIds.has(i.id))];
  }, [data, revealed, categories]);

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

  if (items.length === 0) {
    return (
      <StateMessage
        title="Nothing here yet"
        message="No content matched your preferences. Try choosing different categories in Settings."
      />
    );
  }

  return (
    <>
      <LivePill />

      {hasCustomOrder && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => dispatch(resetOrder())}
            className="text-sm font-medium text-brand hover:underline"
          >
            Reset order
          </button>
        </div>
      )}

      <SortableFeed items={items} />

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