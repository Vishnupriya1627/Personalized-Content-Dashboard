export type ContentType = 'news' | 'movie' | 'social';

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  image?: string;
  url: string;
  category?: string;
  source: string;
  publishedAt: string;
  likes?: number; // used by social posts and trending
}