import PageTitle from '@/components/PageTitle';
import ContentCard from '@/components/cards/ContentCard';
import StateMessage from '@/components/cards/StateMessage';
import { useAppSelector } from '@/store/hooks';

export default function FavoritesPage() {
  const items = useAppSelector((s) => s.favorites.items);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Favorites"
        subtitle={items.length ? `${items.length} saved item${items.length === 1 ? '' : 's'}` : "Content you've saved will show up here."}
      />
      {items.length === 0 ? (
        <StateMessage
          title="No favorites yet"
          message="Tap the heart on any card in your feed to save it here."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <ContentCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}