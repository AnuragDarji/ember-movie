// TMDB service: every movie and TV request goes through here (server-side only,
// so the API key never reaches the browser).
import { cache } from 'react';

const BASE = 'https://api.themoviedb.org/3';
export const IMG = 'https://image.tmdb.org/t/p';

export const hasTmdbKey = () =>
  Boolean(process.env.TMDB_READ_TOKEN || process.env.TMDB_API_KEY);

export async function tmdb(path, params = {}, revalidate = 3600) {
  if (!hasTmdbKey()) return null;
  const url = new URL(BASE + path);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  const headers = { accept: 'application/json' };
  if (process.env.TMDB_READ_TOKEN) {
    headers.Authorization = `Bearer ${process.env.TMDB_READ_TOKEN}`;
  } else {
    url.searchParams.set('api_key', process.env.TMDB_API_KEY);
  }
  try {
    const res = await fetch(url, { headers, next: { revalidate } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const languageNames = (() => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' });
  } catch {
    return null;
  }
})();
export const languageName = (code) => {
  if (!code) return null;
  try {
    return languageNames?.of(code) || code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
};

export async function getGenreList(type) {
  const data = await tmdb(`/genre/${type}/list`, {}, 86400);
  return data?.genres || [];
}

export async function getGenres() {
  const [m, t] = await Promise.all([getGenreList('movie'), getGenreList('tv')]);
  const map = {};
  [...m, ...t].forEach((g) => (map[g.id] = g.name));
  return map;
}

export function normalizeTmdb(item, genreMap = {}, forcedType) {
  const type = forcedType || item.media_type || (item.title ? 'movie' : 'tv');
  if (type !== 'movie' && type !== 'tv') return null;
  const date = item.release_date || item.first_air_date || '';
  return {
    key: `${type}-${item.id}`,
    id: item.id,
    type,
    title: item.title || item.name,
    date,
    year: date ? date.slice(0, 4) : '',
    rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : null,
    poster: item.poster_path ? `${IMG}/w342${item.poster_path}` : null,
    backdrop: item.backdrop_path ? `${IMG}/w1280${item.backdrop_path}` : null,
    overview: item.overview || '',
    language: item.original_language || null,
    genres: item.genres
      ? item.genres.map((g) => g.name)
      : (item.genre_ids || []).map((id) => genreMap[id]).filter(Boolean),
    href: `/title/${type}/${item.id}`,
  };
}

export async function tmdbList(path, params = {}, type) {
  const [data, genres] = await Promise.all([tmdb(path, params), getGenres()]);
  return (data?.results || [])
    .map((i) => normalizeTmdb(i, genres, type))
    .filter((i) => i && i.poster);
}

export function youtubeUrl(key) {
  return key ? `https://www.youtube-nocookie.com/embed/${key}?autoplay=1&rel=0` : null;
}

export function pickTrailer(videos) {
  const yt = (videos?.results || []).filter((v) => v.site === 'YouTube');
  const best =
    yt.find((v) => v.type === 'Trailer' && v.official) ||
    yt.find((v) => v.type === 'Trailer') ||
    yt.find((v) => v.type === 'Teaser') ||
    yt[0];
  return youtubeUrl(best?.key);
}

const today = () => new Date().toISOString().slice(0, 10);

export async function getRecentlyReleased() {
  const twoMonthsAgo = new Date(Date.now() - 60 * 864e5).toISOString().slice(0, 10);
  return tmdbList(
    '/discover/movie',
    {
      sort_by: 'primary_release_date.desc',
      'primary_release_date.gte': twoMonthsAgo,
      'primary_release_date.lte': today(),
      'vote_count.gte': 20,
      with_release_type: '2|3|4',
    },
    'movie'
  );
}

/* ---------- Discover (filters, sorting, pagination) ---------- */

export const SORTS = {
  trending: { label: 'Trending', movie: 'popularity.desc', tv: 'popularity.desc' },
  latest: { label: 'Latest', movie: 'primary_release_date.desc', tv: 'first_air_date.desc' },
  top: { label: 'Top Rated', movie: 'vote_average.desc', tv: 'vote_average.desc' },
  az: { label: 'A–Z', movie: 'title.asc', tv: 'name.asc' },
};

export const LANGUAGES = [
  ['en', 'English'], ['ja', 'Japanese'], ['ko', 'Korean'], ['hi', 'Hindi'],
  ['es', 'Spanish'], ['fr', 'French'], ['de', 'German'], ['it', 'Italian'],
  ['zh', 'Chinese'], ['pt', 'Portuguese'], ['ta', 'Tamil'], ['te', 'Telugu'], ['tr', 'Turkish'],
];

export const REGIONS = [
  ['IN', 'India'], ['US', 'United States'], ['GB', 'United Kingdom'], ['CA', 'Canada'],
  ['AU', 'Australia'], ['DE', 'Germany'], ['FR', 'France'], ['JP', 'Japan'], ['BR', 'Brazil'],
];
export const DEFAULT_REGION = 'IN';

// OTT platforms available in a region (Netflix, Prime Video, Hotstar...), most popular first.
export async function getProviders(type, region) {
  const code = REGIONS.some(([c]) => c === region) ? region : DEFAULT_REGION;
  const data = await tmdb(`/watch/providers/${type}`, { watch_region: code }, 86400);
  return (data?.results || [])
    .sort((a, b) => (a.display_priorities?.[code] ?? 999) - (b.display_priorities?.[code] ?? 999))
    .slice(0, 16)
    .map((p) => ({ id: String(p.provider_id), name: p.provider_name, logo: p.logo_path ? `${IMG}/w92${p.logo_path}` : null }));
}

export async function discover(type, f = {}) {
  const sort = SORTS[f.sort] ? f.sort : 'trending';
  const isMovie = type === 'movie';
  const params = {
    sort_by: SORTS[sort][type],
    page: Math.min(Math.max(Number(f.page) || 1, 1), 500),
    include_adult: 'false',
    with_genres: f.genre,
    with_original_language: f.lang,
    'vote_average.gte': f.rating,
  };
  if (/^\d{1,6}$/.test(f.ott || '')) {
    params.with_watch_providers = f.ott;
    params.watch_region = REGIONS.some(([c]) => c === f.region) ? f.region : DEFAULT_REGION;
    params.with_watch_monetization_types = 'flatrate|free|ads';
  }
  if (f.year) params[isMovie ? 'primary_release_year' : 'first_air_date_year'] = f.year;
  if (sort === 'latest') params[isMovie ? 'primary_release_date.lte' : 'first_air_date.lte'] = today();
  // Keep obscure, barely-rated titles out of rating-based results.
  if (sort === 'top') params['vote_count.gte'] = 300;
  else if (f.rating || sort === 'latest') params['vote_count.gte'] = 20;

  const [data, genres] = await Promise.all([tmdb(`/discover/${type}`, params), getGenres()]);
  return {
    items: (data?.results || []).map((i) => normalizeTmdb(i, genres, type)).filter((i) => i && i.poster),
    page: data?.page || 1,
    totalPages: Math.min(data?.total_pages || 1, 500),
  };
}

/* ---------- Details ---------- */

const fmtRuntime = (mins) => (mins ? `${Math.floor(mins / 60) ? `${Math.floor(mins / 60)}h ` : ''}${mins % 60}m` : null);

// cache(): generateMetadata and the page share one fetch per request.
export const getTitle = cache(async function getTitle(type, id) {
  if (type !== 'movie' && type !== 'tv') return null;
  const [data, genres] = await Promise.all([
    tmdb(`/${type}/${id}`, {
      append_to_response: 'videos,credits,recommendations,similar,watch/providers',
    }),
    getGenres(),
  ]);
  if (!data) return null;
  const base = normalizeTmdb(data, genres, type);
  const crew = data.credits?.crew || [];
  const crewBy = (jobs) => [...new Set(crew.filter((c) => jobs.includes(c.job)).map((c) => c.name))];

  const recs = (data.recommendations?.results?.length ? data.recommendations : data.similar)?.results || [];

  const facts = [];
  if (type === 'movie') {
    if (data.release_date) facts.push(['Released', formatDate(data.release_date)]);
    if (data.runtime) facts.push(['Runtime', fmtRuntime(data.runtime)]);
  } else {
    if (data.first_air_date) facts.push(['First aired', formatDate(data.first_air_date)]);
    if (data.number_of_seasons) facts.push(['Seasons', String(data.number_of_seasons)]);
    if (data.number_of_episodes) facts.push(['Episodes', String(data.number_of_episodes)]);
    if (data.episode_run_time?.[0]) facts.push(['Episode length', fmtRuntime(data.episode_run_time[0])]);
    if (data.networks?.length) facts.push(['Network', data.networks.map((n) => n.name).join(', ')]);
  }
  if (data.status) facts.push(['Status', data.status]);
  if (data.original_language) facts.push(['Language', languageName(data.original_language)]);

  const crewList =
    type === 'movie'
      ? [
          ['Director', crewBy(['Director'])],
          ['Writers', crewBy(['Screenplay', 'Writer', 'Story'])],
          ['Music', crewBy(['Original Music Composer'])],
        ]
      : [
          ['Created by', (data.created_by || []).map((c) => c.name)],
          ['Executive producers', crewBy(['Executive Producer']).slice(0, 4)],
        ];

  return {
    ...base,
    tagline: data.tagline || '',
    runtime:
      type === 'movie'
        ? fmtRuntime(data.runtime)
        : data.number_of_seasons
          ? `${data.number_of_seasons} season${data.number_of_seasons > 1 ? 's' : ''}`
          : null,
    facts,
    crew: crewList.filter(([, names]) => names.length).map(([label, names]) => ({ label, names })),
    trailerUrl: pickTrailer(data.videos),
    providers: data['watch/providers']?.results || {},
    seasons:
      type === 'tv'
        ? (data.seasons || [])
            .filter((s) => s.season_number > 0 && s.episode_count > 0)
            .map((s) => ({
              number: s.season_number,
              name: s.name,
              count: s.episode_count,
              year: s.air_date ? s.air_date.slice(0, 4) : '',
            }))
        : [],
    cast: (data.credits?.cast || []).slice(0, 16).map((c) => ({
      id: c.id,
      name: c.name,
      role: c.character,
      photo: c.profile_path ? `${IMG}/w185${c.profile_path}` : null,
    })),
    similar: recs.map((i) => normalizeTmdb(i, genres, i.media_type || type)).filter((i) => i && i.poster),
  };
});

export async function getSeason(tvId, number) {
  const data = await tmdb(`/tv/${tvId}/season/${number}`);
  if (!data) return null;
  return {
    number: data.season_number,
    name: data.name,
    overview: data.overview || '',
    episodes: (data.episodes || []).map((e) => ({
      number: e.episode_number,
      name: e.name,
      overview: e.overview || '',
      airDate: e.air_date ? formatDate(e.air_date) : null,
      upcoming: e.air_date ? e.air_date > today() : true,
      runtime: fmtRuntime(e.runtime),
      rating: e.vote_average ? Math.round(e.vote_average * 10) / 10 : null,
      still: e.still_path ? `${IMG}/w300${e.still_path}` : null,
    })),
  };
}

export async function getRecommendations(type, id) {
  const [data, genres] = await Promise.all([tmdb(`/${type}/${id}/recommendations`), getGenres()]);
  return (data?.results || []).map((i) => normalizeTmdb(i, genres, type)).filter((i) => i && i.poster);
}

export async function searchTmdb(q) {
  const [data, genres] = await Promise.all([
    tmdb('/search/multi', { query: q, include_adult: 'false' }, 600),
    getGenres(),
  ]);
  return (data?.results || [])
    .map((i) => normalizeTmdb(i, genres))
    .filter((i) => i && i.poster);
}

export function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}
