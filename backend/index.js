import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { posts } from './mockSocial.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors({ origin: ['http://localhost:5173'] }));

const PORT = process.env.PORT || 4000;
const NEWS_KEY = process.env.NEWS_API_KEY;
const OMDB_KEY = process.env.OMDB_API_KEY;

const NEWS_CATEGORIES = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];

// ---------- helpers ----------
async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Upstream error ${res.status}`);
  return res.json();
}

const asyncRoute = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error(err.message);
    res.status(502).json({ error: err.message });
  });

// OMDb returns the string "N/A" for missing values
const clean = (v) => (v && v !== 'N/A' ? v : undefined);

// ---------- normalizers ----------
const normalizeArticle = (a, category) => ({
  id: `news-${Buffer.from(a.url).toString('base64url').slice(0, 24)}`,
  type: 'news',
  title: a.title,
  description: a.description || '',
  image: a.urlToImage || undefined,
  url: a.url,
  category,
  source: a.source?.name || 'News',
  publishedAt: a.publishedAt,
});

const detailCache = new Map();

async function getMovieDetails(imdbID) {
  if (detailCache.has(imdbID)) return detailCache.get(imdbID);
  const d = await getJson(`https://www.omdbapi.com/?i=${imdbID}&plot=short&apikey=${OMDB_KEY}`);
  if (d.Response === 'False') {
    console.log(`OMDb error for ${imdbID}: ${d.Error}`);
    throw new Error(d.Error || 'OMDb lookup failed');
  }
  detailCache.set(imdbID, d);
  return d;
}

function toIso(m) {
  const released = clean(m.Released) && new Date(m.Released);
  if (released && !isNaN(released)) return released.toISOString();
  const year = parseInt(m.Year, 10) || 2000;
  return new Date(`${year}-01-01`).toISOString();
}

const normalizeMovie = (m) => {
  const rating = parseFloat(m.imdbRating);
  return {
    id: `movie-${m.imdbID}`,
    type: 'movie',
    title: m.Title,
    description: clean(m.Plot) || '',
    image: clean(m.Poster),
    url: `https://www.imdb.com/title/${m.imdbID}/`,
    category: 'entertainment',
    source: 'OMDb',
    publishedAt: toIso(m),
    likes: isNaN(rating) ? 0 : Math.round(rating * 10),
  };
};

// ---------- /api/news?categories=technology,sports&page=1&pageSize=10&q=term ----------
app.get('/api/news', asyncRoute(async (req, res) => {
  if (!NEWS_KEY) return res.status(500).json({ error: 'NEWS_API_KEY is not set' });

  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const q = String(req.query.q || '').trim();

  let items = [];

  if (q) {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&sortBy=publishedAt&page=${page}&pageSize=${pageSize}&apiKey=${NEWS_KEY}`;
    const data = await getJson(url);
    items = data.articles.map((a) => normalizeArticle(a, 'general'));
  } else {
    const requested = String(req.query.categories || 'general')
      .split(',')
      .map((c) => c.trim().toLowerCase())
      .filter((c) => NEWS_CATEGORIES.includes(c));
    const cats = requested.length ? requested : ['general'];
    const perCat = Math.max(1, Math.ceil(pageSize / cats.length));

    const results = await Promise.all(
      cats.map(async (cat) => {
        const url = `https://newsapi.org/v2/top-headlines?country=us&category=${cat}&page=${page}&pageSize=${perCat}&apiKey=${NEWS_KEY}`;
        const data = await getJson(url);
        return data.articles.map((a) => normalizeArticle(a, cat));
      })
    );
    items = results.flat();
  }

  items = items.filter((i) => i.title && i.title !== '[Removed]');
  res.json({ items, page });
}));

// ---------- /api/movies?mode=popular|trending&page=1&q=term ----------
const POPULAR_KEYWORDS = ['avengers', 'batman', 'star wars', 'harry potter', 'spider-man', 'matrix', 'lord of the rings'];
const TOP_MOVIE_IDS = [
  'tt0111161', // The Shawshank Redemption
  'tt0068646', // The Godfather
  'tt0468569', // The Dark Knight
  'tt0071562', // The Godfather Part II
  'tt0108052', // Schindler's List
  'tt0110912', // Pulp Fiction
  'tt0109830', // Forrest Gump
  'tt1375666', // Inception
  'tt0137523', // Fight Club
  'tt0133093', // The Matrix
  'tt0816692', // Interstellar
  'tt6751668', // Parasite
];

app.get('/api/movies', asyncRoute(async (req, res) => {
  if (!OMDB_KEY) return res.status(500).json({ error: 'OMDB_API_KEY is not set' });

  const page = Number(req.query.page) || 1;
  const q = String(req.query.q || '').trim();
  const mode = req.query.mode === 'trending' ? 'trending' : 'popular';

  // Trending = top rated from the curated list, ranked by IMDb rating.
  // This must run BEFORE any OMDb search, so it comes first.
  if (mode === 'trending' && !q) {
    if (page > 1) return res.json({ items: [], page });

    const details = await Promise.all(
      TOP_MOVIE_IDS.map((id) =>
        getMovieDetails(id).catch((e) => {
          console.log('Movie lookup failed:', id, e.message);
          return null;
        })
      )
    );

    const items = details
      .filter((d) => d && d.Title)
      .map(normalizeMovie)
      .sort((a, b) => b.likes - a.likes);

    console.log(`Trending: ${items.length} of ${TOP_MOVIE_IDS.length} movies loaded`);
    return res.json({ items, page });
  }

  // Search or popular feed
  let searchUrl;
  if (q) {
    searchUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(q)}&type=movie&page=${page}&apikey=${OMDB_KEY}`;
  } else {
    // Rotate keywords so each page of the feed shows different movies
    const keyword = POPULAR_KEYWORDS[Math.floor((page - 1) / 3) % POPULAR_KEYWORDS.length];
    const omdbPage = ((page - 1) % 3) + 1;
    searchUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(keyword)}&type=movie&page=${omdbPage}&apikey=${OMDB_KEY}`;
  }

  let search = await getJson(searchUrl);

  // Multi-word search found nothing: retry with the longest word
  if ((search.Response === 'False' || !search.Search) && q.includes(' ')) {
    const longest = q.split(/\s+/).sort((a, b) => b.length - a.length)[0];
    search = await getJson(
      `https://www.omdbapi.com/?s=${encodeURIComponent(longest)}&type=movie&page=${page}&apikey=${OMDB_KEY}`
    );
  }

  // OMDb answers 200 with Response:"False" for "not found" or "too many results"
  if (search.Response === 'False' || !search.Search) {
    if (search.Error) console.log(`OMDb: ${search.Error}`);
    return res.json({ items: [], page });
  }

  const details = await Promise.all(
    search.Search.map((m) => getMovieDetails(m.imdbID).catch(() => m))
  );

  const items = details.filter((d) => d.Title).map(normalizeMovie);
  res.json({ items, page });
}));

app.get('/api/social', (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const q = String(req.query.q || '').trim().toLowerCase();
  const cats = String(req.query.categories || '')
    .split(',')
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);

  let list = posts;
  if (cats.length) list = list.filter((p) => cats.includes(p.category));
  if (q) list = list.filter((p) => (p.title + p.description).toLowerCase().includes(q));
  if (req.query.sort === 'likes') list = [...list].sort((a, b) => b.likes - a.likes);

  const start = (page - 1) * pageSize;
  res.json({ items: list.slice(start, start + pageSize), page });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));