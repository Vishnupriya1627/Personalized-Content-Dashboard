import { useState } from 'react';
import { Newspaper, Film, MessageCircle, ExternalLink } from 'lucide-react';
import type { ContentItem, ContentType } from '@/types/content';

const typeMeta: Record<ContentType, { label: string; cta: string; icon: typeof Newspaper }> = {
  news: { label: 'News', cta: 'Read More', icon: Newspaper },
  movie: { label: 'Movie', cta: 'View Details', icon: Film },
  social: { label: 'Post', cta: 'View Post', icon: MessageCircle },
};

export default function ContentCard({ item }: { item: ContentItem }) {
  const [imgFailed, setImgFailed] = useState(false);
  const { label, cta, icon: Icon } = typeMeta[item.type];
  const showImage = item.image && !imgFailed;

  const date = new Date(item.publishedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-44 w-full shrink-0 overflow-hidden bg-border">
        {showImage ? (
          <img
            src={item.image}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <Icon size={36} aria-hidden="true" />
          </div>
        )}
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-text backdrop-blur">
          <Icon size={12} aria-hidden="true" />
          {label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug text-text">{item.title}</h3>
        {item.description && (
          <p className="mt-2 line-clamp-3 text-sm text-muted">{item.description}</p>
        )}

        <div className="mt-auto pt-4">
          <p className="mb-3 text-xs text-muted">
            {item.source} · {date}
          </p>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-on-brand transition hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            {cta}
            <ExternalLink size={14} aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </article>
  );
}