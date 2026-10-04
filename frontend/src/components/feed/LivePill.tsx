import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { revealPending } from '@/features/live/liveSlice';
import { prependToOrder } from '@/features/feed/feedSlice';

export default function LivePill() {
  const dispatch = useAppDispatch();
  const pending = useAppSelector((s) => s.live.pending);
  const categories = useAppSelector((s) => s.preferences.categories);

  // Only count items in the user's categories
  const matching = useMemo(
    () => pending.filter((i) => i.category && categories.includes(i.category)),
    [pending, categories]
  );
  const count = matching.length;

  const show = () => {
    dispatch(prependToOrder(matching.map((i) => i.id)));
    dispatch(revealPending());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <p role="status" className="sr-only">
        {count > 0 ? `${count} new ${count === 1 ? 'item' : 'items'} available` : ''}
      </p>

      <div className="pointer-events-none sticky top-20 z-10 flex h-0 justify-center">
        {count > 0 && (
          <motion.button
            type="button"
            onClick={show}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto flex h-fit items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-on-brand shadow-lg transition hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            <ArrowUp size={14} aria-hidden="true" />
            {count} new {count === 1 ? 'item' : 'items'}
          </motion.button>
        )}
      </div>
    </>
  );
}