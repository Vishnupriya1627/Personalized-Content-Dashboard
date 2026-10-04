import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ContentItem } from "@/types/content";
import { interleave } from "@/lib/interleave";

interface FeedArgs {
  categories: string[];
  page: number;
}

interface SearchArgs {
  q: string;
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

const itemsOf = (r: { data?: unknown }) =>
  (r.data as ListResponse | undefined)?.items ?? [];

// Append new pages instead of replacing, skipping duplicates
const mergePages = (current: FeedResult, incoming: FeedResult) => {
  const seen = new Set(current.items.map((i) => i.id));
  for (const item of incoming.items) {
    if (!seen.has(item.id)) current.items.push(item);
  }
  current.page = incoming.page;
  current.hasMore = incoming.hasMore;
};

export const contentApi = createApi({
  reducerPath: "contentApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (build) => ({
    getFeed: build.query<FeedResult, FeedArgs>({
      async queryFn({ categories, page }, _api, _extra, baseQuery) {
        const cats = encodeURIComponent(categories.join(","));

        const [news, movies, social] = await Promise.all([
          baseQuery(`/news?categories=${cats}&page=${page}&pageSize=8`),
          baseQuery(`/movies?page=${page}`),
          baseQuery(`/social?categories=${cats}&page=${page}&pageSize=6`),
        ]);

        if (news.error && movies.error && social.error)
          return { error: news.error };

        const items = interleave(
          itemsOf(news),
          itemsOf(movies),
          itemsOf(social),
        );
        return { data: { items, page, hasMore: items.length > 0 } };
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}-${queryArgs.categories.join(",")}`,
      merge: mergePages,
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
    }),

    searchContent: build.query<FeedResult, SearchArgs>({
      async queryFn({ q, page }, _api, _extra, baseQuery) {
        const term = encodeURIComponent(q);

        const [news, movies, social] = await Promise.all([
          baseQuery(`/news?q=${term}&page=${page}&pageSize=8`),
          baseQuery(`/movies?q=${term}&page=${page}`),
          baseQuery(`/social?q=${term}&page=${page}&pageSize=6`),
        ]);

        if (news.error && movies.error && social.error)
          return { error: news.error };

        const items = interleave(
          itemsOf(news),
          itemsOf(movies),
          itemsOf(social),
        );
        return { data: { items, page, hasMore: items.length > 0 } };
      },
      // One cache entry per search term, so repeating a search is instant and costs no API quota
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}-${queryArgs.q.toLowerCase()}`,
      merge: mergePages,
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
    }),

    getTrending: build.query<
      ContentItem[],
      { type: "news" | "movies" | "social"; categories: string[] }
    >({
      query: ({ type, categories }) => {
        const cats = encodeURIComponent(categories.join(","));
        if (type === "news") return `/news?categories=${cats}&pageSize=6`;
        if (type === "movies") return `/movies?mode=trending`;
        return `/social?categories=${cats}&sort=likes&pageSize=6`;
      },
      transformResponse: (res: ListResponse, _meta, arg) =>
        res.items.slice(0, arg.type === 'movies' ? 5 : 6),
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetFeedQuery, useSearchContentQuery, useGetTrendingQuery } = contentApi;
