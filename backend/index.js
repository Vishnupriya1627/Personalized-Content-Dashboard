import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { posts } from './mockSocial.js';
import { generateLiveItem } from './liveFeed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const ALLOWED_ORIGINS = ['http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean);
app.use(cors({ origin: ALLOWED_ORIGINS }));

const PORT = process.env.PORT || 4000;
const NEWS_KEY = process.env.NEWS_API_KEY;
const OMDB_KEY = process.env.OMDB_API_KEY;

const NEWS_CATEGORIES = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];

// ---------- helpers ----------
async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body.Error || body.message || '';
    } catch {
      /* body wasn't JSON */
    }
    throw new Error(`Upstream error ${res.status}${detail ? `: ${detail}` : ''}`);
  }
  return res.json();
}

// ---------- server-side cache (protects the NewsAPI daily quota) ----------
const cache = new Map(); // url -> { data, expires }
const inflight = new Map(); // url -> pending promise
const FRESH_MS = 10 * 60 * 1000;

async function cachedJson(url, ttl = FRESH_MS) {
  const hit = cache.get(url);
  if (hit && hit.expires > Date.now()) return hit.data;
  if (inflight.has(url)) return inflight.get(url); // share one call between identical requests

  const promise = getJson(url)
    .then((data) => {
      if (cache.size > 500) cache.delete(cache.keys().next().value); // keep memory bounded
      cache.set(url, { data, expires: Date.now() + ttl });
      return data;
    })
    .catch((err) => {
      if (hit) {
        console.log('Upstream failed, serving stale cached response');
        return hit.data; // expired, but better than an error
      }
      throw err;
    })
    .finally(() => inflight.delete(url));

  inflight.set(url, promise);
  return promise;
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
 
app.get('/api/news', asyncRoute(async (req, res) => {
  if (!NEWS_KEY) return res.status(500).json({ error: 'NEWS_API_KEY is not set' });

  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const q = String(req.query.q || '').trim();

  let items = [];

  if (q) {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&sortBy=publishedAt&page=${page}&pageSize=${pageSize}&apiKey=${NEWS_KEY}`;
    const data = await cachedJson(url);
    items = data.articles.map((a) => normalizeArticle(a, 'general'));
  } else {
    const requested = String(req.query.categories || 'general')
      .split(',')
      .map((c) => c.trim().toLowerCase())
      .filter((c) => NEWS_CATEGORIES.includes(c));
    const cats = requested.length ? requested : ['general'];
    const perCat = Math.max(1, Math.ceil(pageSize / cats.length));

    const results = await Promise.allSettled(
      cats.map(async (cat) => {
        const url = `https://newsapi.org/v2/top-headlines?country=us&category=${cat}&page=${page}&pageSize=${perCat}&apiKey=${NEWS_KEY}`;
        const data = await cachedJson(url);
        return data.articles.map((a) => normalizeArticle(a, cat));
      })
    );
    const ok = results.filter((r) => r.status === 'fulfilled');
    if (ok.length === 0) throw results[0].reason;  
    items = ok.flatMap((r) => r.value);
  }

  items = items.filter((i) => i.title && i.title !== '[Removed]');
  res.json({ items, page });
}));
 
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
 
  let searchUrl;
  if (q) {
    searchUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(q)}&type=movie&page=${page}&apikey=${OMDB_KEY}`;
  } else {
    const keyword = POPULAR_KEYWORDS[Math.floor((page - 1) / 3) % POPULAR_KEYWORDS.length];
    const omdbPage = ((page - 1) % 3) + 1;
    searchUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(keyword)}&type=movie&page=${omdbPage}&apikey=${OMDB_KEY}`;
  }

  let search = await cachedJson(searchUrl, 60 * 60 * 1000);  
  if ((search.Response === 'False' || !search.Search) && q.includes(' ')) {
    const longest = q.split(/\s+/).sort((a, b) => b.length - a.length)[0];
    search = await cachedJson(
      `https://www.omdbapi.com/?s=${encodeURIComponent(longest)}&type=movie&page=${page}&apikey=${OMDB_KEY}`,
      60 * 60 * 1000
    );
  } 

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
 
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const LIVE_INTERVAL_MS = Number(process.env.LIVE_INTERVAL_MS) || 8000;

wss.on('connection', (ws, req) => { 
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    ws.close(1008, 'Origin not allowed');
    return;
  }

  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  ws.on('error', (err) => console.error('WS client error:', err.message));
  ws.send(JSON.stringify({ type: 'connected' }));
});
 
const broadcastTimer = setInterval(() => {
  if (wss.clients.size === 0) return;
  const message = JSON.stringify({ type: 'new_item', payload: generateLiveItem() });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(message);
  }
}, LIVE_INTERVAL_MS);
 
const heartbeatTimer = setInterval(() => {
  for (const client of wss.clients) {
    if (client.isAlive === false) {
      client.terminate();
      continue;
    }
    client.isAlive = false;
    client.ping();
  }
}, 30000);

wss.on('close', () => {
  clearInterval(broadcastTimer);
  clearInterval(heartbeatTimer);
});

server.listen(PORT, () => console.log(`API + WebSocket server running on http://localhost:${PORT}`));