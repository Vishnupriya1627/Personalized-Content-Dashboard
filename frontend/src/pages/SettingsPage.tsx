import { Check } from 'lucide-react';
import PageTitle from '@/components/PageTitle';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCategories } from '@/features/preferences/preferencesSlice';

const ALL_CATEGORIES = [
  { id: 'technology', label: 'Technology' },
  { id: 'sports', label: 'Sports' },
  { id: 'business', label: 'Finance & Business' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'science', label: 'Science' },
  { id: 'health', label: 'Health' },
];

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.preferences.categories);

  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((c) => c !== id) : [...selected, id];
    if (next.length === 0) return; // keep at least one
    dispatch(setCategories(next));
  };

  return (
    <div className="space-y-6">
      <PageTitle title="Settings" subtitle="Choose the categories you want in your feed." />

      <section aria-labelledby="cat-heading" className="rounded-xl border border-border bg-surface p-5">
        <h2 id="cat-heading" className="font-semibold text-text">Favorite categories</h2>
        <p className="mt-1 text-sm text-muted">
          Changes save automatically. Keep at least one selected.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {ALL_CATEGORIES.map(({ id, label }) => {
            const active = selected.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand/40 ${
                  active
                    ? 'border-accent bg-accent text-on-accent'
                    : 'border-border bg-bg text-muted hover:text-text'
                }`}
              >
                {active && <Check size={14} aria-hidden="true" />}
                {label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}