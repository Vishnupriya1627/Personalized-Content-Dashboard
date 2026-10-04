import { useAppSelector } from '@/store/hooks';
import type { LiveStatus } from '@/features/live/liveSlice';

const meta: Record<LiveStatus, { label: string; dot: string }> = {
  live: { label: 'Live', dot: 'bg-emerald-500' },
  connecting: { label: 'Connecting', dot: 'bg-amber-500 animate-pulse' },
  reconnecting: { label: 'Reconnecting', dot: 'bg-amber-500 animate-pulse' },
  offline: { label: 'Offline', dot: 'bg-muted' },
};

export default function LiveBadge() {
  const status = useAppSelector((s) => s.live.status);
  const { label, dot } = meta[status];

  return (
    <span
      role="status"
      aria-label={`Real-time updates: ${label}`}
      className="mr-1 hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted sm:flex"
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}