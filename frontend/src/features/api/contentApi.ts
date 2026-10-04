import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ContentItem } from '@/types/content';
import { interleave } from '@/lib/interleave';

interface FeedArgs {
  categories: string[];
  page: number;
}

interface FeedResult {
  items: ContentItem[];
  page: number;
  hasMore: boolean;
}

interface ListResponse {
  items: ContentItem[];
}

export const contentApi = createApi({
  reducerPath: 'contentApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (build) => ({
    getFeed: build.query<FeedResult, FeedArgs>({
      async queryFn({ categories, page }, _api, _extra, baseQuery) {
        const cats = encodeURIComponent(categories.join(','));

        const [news, movies, social] = await Promise.all([
          baseQuery(`/news?categories=${cats}&page=${page}&pageSize=8`),
          baseQuery(`/movies?page=${page}`),
          baseQuery(`/social?categories=${cats}&page=${page}&pageSize=6`),
        ]);

        // Only fail if every source failed, so one broken API doesn't blank the feed
        if (news.error && movies.error && social.error) {
          return { error: news.error };
        }

        const itemsOf = (r: typeof news) => (r.data as ListResponse | undefined)?.items ?? [];
        const items = interleave(itemsOf(news), itemsOf(movies), itemsOf(social));

        return { data: { items, page, hasMore: items.length > 0 } };
      },

      // One cache entry per category set, so pages accumulate in it
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}-${queryArgs.categories.join(',')}`,

      // Append new pages instead of replacing, skipping duplicates
      merge: (current, incoming) => {
        const seen = new Set(current.items.map((i) => i.id));
        for (const item of incoming.items) {
          if (!seen.has(item.id)) current.items.push(item);
        }
        current.page = incoming.page;
        current.hasMore = incoming.hasMore;
      },

      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),
  }),
});

export const { useGetFeedQuery } = contentApi;