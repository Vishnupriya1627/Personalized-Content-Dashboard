# Personalized Content Dashboard

A responsive dashboard that brings **news, movies and social posts** into one personalized feed. Users sign in with Firebase, choose their favorite categories, search, drag cards into their own order, save favorites, track what they've read, and receive live updates over WebSockets.

| | |
|---|---|
| **Live Site** | https://personalized-content-dashboard-vert.vercel.app |
| **Demo video** | See [Demo video](#demo-video) below |
| **Repository** | `https://github.com/Vishnupriya1627/Personalized-Content-Dashboard` |

---

## Demo video

<!--
HOW TO ADD YOUR VIDEO (pick one):

A) Upload to GitHub: edit this README on github.com, then drag your .mp4 into the editor.
   GitHub uploads it and inserts a link that plays inline. (Limit: 10 MB on free plans.)

B) YouTube / Google Drive: paste the link below, for example:
   [![Demo video](docs/video-thumbnail.png)](https://youtu.be/YOUR_VIDEO_ID)

Delete this comment once done.
-->

**▶ Paste your demo video here**

---

## Screenshots

<!-- Create a docs/ folder, add your screenshots, and keep the lines below. -->

| Feed (light) | Feed (dark) |
|---|---|
| <img width="600" height="300" alt="light mode" src="https://github.com/user-attachments/assets/08eb2285-70b7-405a-b1ab-5ef20a604cb9" /> | <img width="600" height="300" alt="dark mode" src="https://github.com/user-attachments/assets/c8022a6c-64d4-4583-b2c7-b1246152ce41" /> |


| Trending | Settings & profile |
|---|---|
| <img width="600" height="300" alt="trending page" src="https://github.com/user-attachments/assets/aacc0300-0773-4927-a666-19ae14ca5577" />| <img width="600" height="300" alt="settings page" src="https://github.com/user-attachments/assets/048e5c9e-244a-4f60-b747-5768e5f13042" />

| Favourites | Read |
|---|---|
| <img width="1265" height="659" alt="favourites page" src="https://github.com/user-attachments/assets/16ebfb00-d012-45d1-a7d7-fed473182835" />| <img width="1267" height="665" alt="read page" src="https://github.com/user-attachments/assets/d9d1e901-3caf-4e21-81ce-f30aee328b1e" />


## Features

### Core
- **Authentication**: email/password and Google sign-in with Firebase Authentication. Dashboard routes are protected, and sessions survive page reloads.
- **Personalized feed**: news, movies and posts interleaved into one feed, based on the categories chosen in Settings.
- **Interactive content cards**: image with fallback, type badge, headline, description, source, date, and a call-to-action button (*Read More*, *View Details*, *View Post*).
- **Infinite scrolling**: pages load automatically as you approach the bottom, using `IntersectionObserver`.
- **Trending page**: top news in your categories, top-rated movies, and most-liked posts, each in its own section with filter chips.
- **Favorites**: heart any card and find it on the Favorites page.
- **Debounced search**: filters the feed itself (400 ms debounce). It matches title, description, source and category in already-loaded items and favorites, then adds remote results from the APIs. Clearing the box restores the full feed instantly.
- **Drag-and-drop ordering** (`@dnd-kit`): reorder cards with the mouse, touch or keyboard. The order is saved and can be reset.
- **Dark mode**: CSS custom properties plus Tailwind, with no flash of the wrong theme on load.
- **Animations** (Framer Motion): page transitions, card entrance and hover effects, skeleton loaders and spinners. Respects the OS "reduce motion" setting.

### Bonus
- **Real-time updates**: a WebSocket server pushes new items every few seconds. A status badge shows *Live / Reconnecting*, and new items collect behind a **"N new items"** pill so the layout never jumps while you read.
- **Profile customization**: change display name and photo URL, stored on the Firebase account.

### Creative additions
- **Read tracking**: mark cards as read (or open them to mark them automatically). Read cards dim slightly, and a dedicated **Read** page lists them with a *Clear all* option.
- **Graceful degradation**: if a news source is unavailable, the feed still works, and clearly labelled sample headlines are served so the app is never empty.

---

## Tech stack

| Area | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router |
| Styling | Tailwind CSS v4 with CSS custom properties |
| State | Redux Toolkit, RTK Query, redux-persist |
| Auth | Firebase Authentication |
| Drag-and-drop | `@dnd-kit` |
| Animation | Framer Motion |
| Backend | Node.js, Express 5, `ws` |
| Data sources | NewsAPI, OMDb, mock social API |
| Testing | Vitest, React Testing Library, Playwright |
| Hosting | Vercel (frontend), Render (backend + WebSocket) |

---

## Architecture

```
Browser (React SPA on Vercel)
   │
   ├── Firebase Auth (login, profile)
   │
   ├── /api/*  ──(Vercel rewrite)──►  Express server (Render)
   │                                     ├── /api/news    ─► NewsAPI   (cached, with fallback)
   │                                     ├── /api/movies  ─► OMDb      (cached)
   │                                     └── /api/social  ─► mock data
   │
   └── wss://…/ws  ────────────────►  WebSocket server (same Express process)
```

### Key design decisions

- **API keys never reach the browser.** The frontend only talks to `/api/*`. The Express server holds the NewsAPI and OMDb keys and forwards requests.
- **One shape for everything.** Every source is normalized to a single `ContentItem` type, so cards, search, favorites and drag-and-drop don't care where an item came from.
- **RTK Query for data fetching.** One endpoint fetches the three sources in parallel and merges the pages. If one source fails, the others still render. Results are cached per category set.
- **Server-side caching.** Identical upstream requests are cached for 10 minutes (1 hour for movie searches) and shared while in flight. If the upstream API fails, the last good response is served. This protects the free-tier quotas.
- **Persistence boundaries.** Only `preferences`, `favorites`, `read` and `feed` (custom order) are persisted. Auth is restored by Firebase, API data lives in the RTK Query cache, and live items are intentionally not persisted.
- **Why a separate backend.** Vercel's serverless platform can't host WebSockets, and NewsAPI's free plan blocks browser requests in production. A small Express service solves both and keeps keys secret.
- **Layout stability.** Live items queue behind a pill instead of pushing the feed down while the user is reading.

### Project structure

```
content-dashboard/
├── frontend/
│   ├── src/
│   │   ├── components/   # layout, cards, feed, settings, trending
│   │   ├── features/     # redux slices + RTK Query API (auth, preferences, favorites, feed, read, live, search)
│   │   ├── hooks/        # useDebounce, useInfiniteScroll, useLiveFeed
│   │   ├── layouts/      # DashboardLayout, ProtectedRoute
│   │   ├── lib/          # firebase, interleave, matchesQuery
│   │   ├── pages/        # Login, Feed, Trending, Favorites, Read, Settings
│   │   ├── store/        # store, typed hooks
│   │   └── __tests__/    # unit + integration tests
│   ├── e2e/              # Playwright tests
│   └── vercel.json       # API rewrite + SPA fallback
└── backend/
    ├── index.js          # Express routes, caching, WebSocket server
    ├── mockSocial.js     # mock social posts
    ├── mockNews.js       # sample news fallback
    └── liveFeed.js       # live item generator
```

---

## User flow

1. **Sign in or sign up** with email/password or Google. Unauthenticated visitors are redirected to the login page.
2. **Land on the feed**: a mixed grid of news, movies and posts for your categories.
3. **Interact**: heart a card to save it, press *Mark read*, open the story, or drag the handle to reorder.
4. **Search**: type in the header. After a short pause the feed filters. Clear the box to get everything back.
5. **Stay current**: when the badge shows *Live*, a pill announces new items. Click it to add them to the top.
6. **Explore**: *Trending* shows what's popular, *Favorites* and *Read* show your saved and finished items.
7. **Customize** in *Settings*: pick categories, and update your name and photo.
8. **Toggle dark mode** from the header, and **sign out** from the avatar menu.

---

## Getting started

### Prerequisites
- Node.js 20 or newer
- A Firebase project with **Email/Password** and **Google** sign-in enabled
- A [NewsAPI](https://newsapi.org) key and an [OMDb](https://www.omdbapi.com/apikey.aspx) key (both free)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd content-dashboard

cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment variables

**`backend/.env`**

| Variable | Description |
|---|---|
| `PORT` | Server port (default `4000`) |
| `NEWS_API_KEY` | NewsAPI key |
| `OMDB_API_KEY` | OMDb key (activate it from the confirmation email) |
| `FRONTEND_URL` | Deployed frontend origin, used for CORS and the WebSocket origin check (no trailing slash) |
| `LIVE_INTERVAL_MS` | Optional. Live item interval in ms (default `8000`) |

**`frontend/.env.local`**

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | e.g. `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_WS_URL` | Production only, e.g. `wss://your-backend.onrender.com/ws` |

Firebase web keys are designed to be public. Access is controlled by the **Authorized domains** list in the Firebase console. NewsAPI and OMDb keys live only in the backend.

### 3. Run locally

Use two terminals:

```bash
# Terminal 1: backend (http://localhost:4000)
cd backend
npm run dev

# Terminal 2: frontend (http://localhost:5173)
cd frontend
npm run dev
```

In development, Vite proxies `/api` and `/ws` to the backend, so no extra setup is needed.

---

## Testing

```bash
cd frontend
npm run test:run   # unit + integration tests (Vitest + React Testing Library)
npm run e2e        # end-to-end tests (Playwright)
```

| Layer | What it covers |
|---|---|
| **Unit** | Redux slices (preferences, favorites, feed order, search, live, read), `interleave`, `matchesQuery`, `useDebounce`, `ContentCard` behavior |
| **Integration** | Feed in loading, success, empty, error and error-after-data states; Favorites, Read and Settings pages; search merge logic; live-items pill; profile form validation |
| **E2E (Playwright)** | Redirect when logged out, wrong-password error, login/reload/logout, search filtering and restore, debounced requests, keyboard drag-and-drop with persistence |

E2E tests mock the REST APIs, so they use no API quota. Login tests need a Firebase test user in `frontend/.env.e2e.local`:

```
E2E_EMAIL=e2e-test@example.com
E2E_PASSWORD=your-test-password
```

First time only: `npx playwright install chromium`.

---

## Accessibility

- Semantic landmarks, labelled search, and keyboard-reachable controls with visible focus rings
- Icon buttons have `aria-label`s, and toggles use `aria-pressed`
- Drag-and-drop works with the keyboard (Space to pick up, arrow keys to move, Space to drop)
- Live updates are announced to screen readers through a polite status region
- Loading, empty and error states are announced with appropriate roles
- Honors `prefers-reduced-motion`
- Color tokens defined for both light and dark themes

<!-- Optional: add your Lighthouse score here, e.g. "Lighthouse accessibility: 100" -->

---

## Performance

- Debounced search (400 ms) to avoid a request per keystroke
- Infinite scroll with paginated requests and RTK Query caching, with de-duplication when merging pages
- Server-side response caching and request coalescing
- Lazy-loaded images, skeleton placeholders, and a single shared WebSocket connection

---

## Security

- Third-party API keys stay on the server and are never bundled into the frontend
- CORS and the WebSocket handshake are restricted to the configured frontend origin
- Authentication handled by Firebase, with protected routes on the client
- `.env` files are git-ignored
- Profile photo URLs are validated as `http(s)` before saving

---

## Notes and known limitations

- **Trending movies.** OMDb has no trending endpoint, so the movies section shows top-rated titles from a curated list, ranked by IMDb rating.
- **Social posts are mocked.** They come from a generated dataset on the backend, as the assignment allows.
- **Live items are simulated.** The WebSocket server generates sample items on a timer. Their links open a search page, not a real post.
- **News fallback.** NewsAPI's free plan allows 100 requests per day. When it's exhausted, the backend serves labelled **Sample News** headlines until the quota resets.
- **Free hosting.** Render's free tier sleeps when idle, so the first request after a pause can take around 30 seconds.
- **Per-browser data.** Favorites, read items and card order are stored in the browser (`localStorage`), not synced across devices.
- **Not implemented.** Multi-language support (optional bonus).

---

## Deployment

- **Frontend (Vercel):** root directory `frontend`, with the `VITE_*` variables set. `frontend/vercel.json` rewrites `/api/*` to the backend and falls back to `index.html` for client-side routes.
- **Backend (Render):** root directory `backend`, build `npm install`, start `npm start`, with the backend variables set.
- **Firebase:** the Vercel domain is added under **Authentication → Settings → Authorized domains**.

---

## Author

**Vishnupriya**: `<GitHub profile link>`
