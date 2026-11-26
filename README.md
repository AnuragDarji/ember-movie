# Marquee — Movies, TV & Anime (Next.js 14)

A dark, streaming-style website for browsing movies and TV shows (TMDB) and anime (AniList), with trailers, ratings, search and a saved "My List".

## Setup

1. Install Node.js 18.18 or newer.
2. Get a free TMDB key: https://www.themoviedb.org/settings/api
3. Copy `.env.example` to `.env.local` and paste your **API Read Access Token** into `TMDB_READ_TOKEN`
   (or your v3 key into `TMDB_API_KEY`).
4. Run:

```bash
npm install
npm run dev
```

Open http://localhost:3000. AniList needs no key.

## Pages

| Route | What it shows |
| --- | --- |
| `/` | Featured hero + Trending, Top Rated, New Releases, Coming Soon, TV and anime rows |
| `/movies` | Popular, in theaters, top rated, upcoming, genre rows |
| `/tv` | Popular, airing today, on the air, top rated, genre rows |
| `/anime` | AniList trending, movies, popular, highest rated, upcoming |
| `/trending` | Today and this week across movies, TV and anime |
| `/title/[movie|tv]/[id]` | TMDB details, trailer, cast, recommendations |
| `/anime/[id]` | AniList details, trailer, characters, recommendations |
| `/search?q=` | Searches TMDB and AniList together |
| `/my-list` | Titles saved with "Add to List" (stored in the browser) |

## Structure

```
app/            routes (App Router, server components, hourly revalidation)
components/     Navbar, Hero, Row, Card, TrailerModal, DetailView, Footer…
lib/tmdb.js     TMDB fetch + normalizing
lib/anilist.js  AniList GraphQL queries + normalizing
lib/useMyList.js  localStorage-backed list hook
```

## Customizing

- Colors live as CSS variables at the top of `app/globals.css` (`--accent` is the purple).
  For crimson, set `--accent: #e11d48; --accent-hi: #fb7185; --accent-glow: rgba(225,29,72,.55);`
- The newsletter form only validates locally — connect it to your email provider in `components/Footer.js`.

## Deploy

Push to GitHub and import on Vercel; add `TMDB_READ_TOKEN` as an environment variable.

TMDB requires attribution (included in the footer). Follow the TMDB and AniList API terms.
