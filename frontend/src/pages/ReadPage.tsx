import PageTitle from '@/components/PageTitle';
import ContentCard from '@/components/cards/ContentCard';
import StateMessage from '@/components/cards/StateMessage';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearRead } from '@/features/read/readSlice';

export default function ReadPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.read.items);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <PageTitle
          title="Read"
          subtitle={
            items.length
              ? `${items.length} item${items.length === 1 ? '' : 's'} you've read`
              : 'Everything you open or mark as read shows up here.'
          }
        />
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => dispatch(clearRead())}
            className="shrink-0 text-sm font-medium text-brand hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <StateMessage
          title="Nothing read yet"
          message="Open a story, or press “Mark read” on any card, and it will be listed here."
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