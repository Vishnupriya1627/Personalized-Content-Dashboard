import PageTitle from '@/components/PageTitle';
import Feed from '@/components/feed/Feed';
import SearchResults from '@/components/feed/SearchResults';
import { useAppSelector } from '@/store/hooks';

export default function FeedPage() {
  const user = useAppSelector((s) => s.auth.user);
  const categories = useAppSelector((s) => s.preferences.categories);
  const q = useAppSelector((s) => s.search.query);
  const first = (user?.name || user?.email || '').split(/[ @]/)[0];
  const searching = q.length > 0;

  return (
    <div className="space-y-6">
      <PageTitle
        title={searching ? `Results for "${q}"` : `Hello, ${first}`}
        subtitle={searching ? 'Across news, movies and posts.' : 'News, movies and posts picked for you.'}
      />

      <div hidden={searching}>
        <Feed key={categories.join(',')} />
      </div>

      {searching && <SearchResults key={q.toLowerCase()} q={q} />}
    </div>
  );
}