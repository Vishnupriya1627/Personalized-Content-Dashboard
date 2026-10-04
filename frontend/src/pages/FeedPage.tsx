import PageTitle from '@/components/PageTitle';
import Feed from '@/components/feed/Feed';
import { useAppSelector } from '@/store/hooks';

export default function FeedPage() {
  const user = useAppSelector((s) => s.auth.user);
  const categories = useAppSelector((s) => s.preferences.categories);
  const first = (user?.name || user?.email || '').split(/[ @]/)[0];

  return (
    <div className="space-y-6">
      <PageTitle title={`Hello, ${first}`} subtitle="News, movies and posts picked for you." />
      <Feed key={categories.join(',')} />
    </div>
  );
}