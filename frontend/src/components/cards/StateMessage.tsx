interface Props {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function StateMessage({ title, message, actionLabel, onAction }: Props) {
  return (
    <div role="status" className="mx-auto max-w-sm rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <h2 className="font-semibold text-text">{title}</h2>
      <p className="mt-1 text-sm text-muted">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-on-brand transition hover:bg-brand-hover"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}