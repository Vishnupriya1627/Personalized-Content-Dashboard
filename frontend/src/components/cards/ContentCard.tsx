import { useState } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  Film,
  MessageCircle,
  ExternalLink,
  Heart,
  Check,
} from "lucide-react";
import type { ContentItem, ContentType } from "@/types/content";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleFavorite } from "@/features/favorites/favoritesSlice";
import { markRead, toggleRead } from "@/features/read/readSlice";

const typeMeta: Record<
  ContentType,
  { label: string; cta: string; icon: typeof Newspaper }
> = {
  news: { label: "News", cta: "Read More", icon: Newspaper },
  movie: { label: "Movie", cta: "View Details", icon: Film },
  social: { label: "Post", cta: "View Post", icon: MessageCircle },
};

export default function ContentCard({ item }: { item: ContentItem }) {
  const [imgFailed, setImgFailed] = useState(false);
  const dispatch = useAppDispatch();
  const isFavorite = useAppSelector((s) =>
    s.favorites.items.some((f) => f.id === item.id),
  );
  const isRead = useAppSelector((s) =>
    s.read.items.some((r) => r.id === item.id),
  );
  const { label, cta, icon: Icon } = typeMeta[item.type];
  const showImage = item.image && !imgFailed;

  const date = new Date(item.publishedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: isRead ? 0.75 : 1, y: 0 }}
      whileHover={{ y: -4, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md"
    >
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
          <div
            className={`flex h-full w-full items-center justify-center ${
              item.type === "news"
                ? "bg-gradient-to-br from-accent/30 to-border"
                : item.type === "movie"
                  ? "bg-gradient-to-br from-brand/25 to-border"
                  : "bg-gradient-to-br from-border to-accent/20"
            } text-brand`}
          >
            <Icon size={40} aria-hidden="true" />
          </div>
        )}

        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-text backdrop-blur">
          <Icon size={12} aria-hidden="true" />
          {label}
        </span>

        <button
          type="button"
          onClick={() => dispatch(toggleFavorite(item))}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? `Remove ${item.title} from favorites`
              : `Add ${item.title} to favorites`
          }
          className="absolute right-3 top-3 rounded-full bg-surface/90 p-2 backdrop-blur transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand/40"
        >
          <Heart
            size={16}
            aria-hidden="true"
            className={isFavorite ? "text-red-600" : "text-muted"}
            fill={isFavorite ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug text-text">
          {item.title}
        </h3>
        {item.description && (
          <p className="mt-2 line-clamp-3 text-sm text-muted">
            {item.description}
          </p>
        )}

        <div className="mt-auto pt-4">
          <p className="mb-3 text-xs text-muted">
            {item.source} · {date}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => dispatch(markRead(item))}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-on-brand transition hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand/40"
            >
              {cta}
              <ExternalLink size={14} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>

            <button
              type="button"
              onClick={() => dispatch(toggleRead(item))}
              aria-pressed={isRead}
              aria-label={
                isRead
                  ? `Mark ${item.title} as unread`
                  : `Mark ${item.title} as read`
              }
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand/40 ${
                isRead
                  ? "border-accent bg-accent text-on-accent"
                  : "border-border text-muted hover:text-text"
              }`}
            >
              <Check size={14} aria-hidden="true" />
              {isRead ? "Read" : "Mark read"}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
