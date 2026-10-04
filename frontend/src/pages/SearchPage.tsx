import { useCallback, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useSearchContentQuery } from '@/features/api/contentApi';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import PageTitle from '@/components/PageTitle';
import ContentCard from '@/components/cards/ContentCard';
import CardSkeleton from '@/components/cards/CardSkeleton';
import StateMessage from '@/components/cards/StateMessage';

const gridClass = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3';

function SearchResults({ q }: { q: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, refetch } = useSearchContentQuery({ q, page });

  const hasMore = data?.hasMore ?? false;
  const loadMore = useCallback(() => setPage((p) => p + 1), []);
  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !isFetching && !isError);

  if (isLoading) {
    return (
      <div className={gridClass} aria-busy="true" aria-label="Searching">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError && !data) {
    return (
      <StateMessage
        title="Search failed"
        message="Something went wrong while searching. Please try again."
        actionLabel="Try again"
        onAction={refetch}
      />
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <StateMessage
        title="No results"
        message={`Nothing matched "${q}". Try a different keyword.`}
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
        <div className="flex justify-center py-8" role="status" aria-label="Loading more results">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        </div>
      )}

      {!hasMore && !isFetching && (
        <p className="py-8 text-center text-sm text-muted">End of results.</p>
      )}
    </>
  );
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').trim();

  if (q.length < 2) return <Navigate to="/" replace />;

  return (
    <div className="space-y-6">
      <PageTitle title={`Results for "${q}"`} subtitle="Across news, movies and posts." />
      <SearchResults key={q.toLowerCase()} q={q} />
    </div>
  );
}