export default function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-border bg-surface" aria-hidden="true">
      <div className="aspect-video bg-border" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-border" />
        <div className="h-3 w-full rounded bg-border" />
        <div className="h-3 w-5/6 rounded bg-border" />
        <div className="h-9 w-28 rounded-lg bg-border" />
      </div>
    </div>
  );
}