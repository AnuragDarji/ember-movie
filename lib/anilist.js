// AniList service: all anime data comes from the public AniList GraphQL API.
import { cache } from 'react';

const ENDPOINT ='https://graphql.anilist.co';

const FRAGMENT = `
fragment F on Media {
  id
  idMal
  title { romaji english }
  coverImage { extraLarge large }
  bannerImage
  averageScore
  seasonYear
  season
  startDate { year month day }
  format
  status
  episodes
  genres
  description(asHtml: false)
  trailer { id site }
}`;

export const ANIME_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mecha', 'Music',
  'Mystery', 'Psychological', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
];

export async function anilist(query, variables = {}, revalidate = 3600) {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: query + FRAGMENT, variables }),
      next: { revalidate },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

const stripHtml = (s = '') =>
  s.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const STATUS = {
  RELEASING: 'Airing',
  FINISHED: 'Finished',
  NOT_YET_RELEASED: 'Upcoming',
  CANCELLED: 'Cancelled',
  HIATUS: 'On hiatus',
};
const FORMAT = { TV: 'TV', TV_SHORT: 'TV short', MOVIE: 'Movie', SPECIAL: 'Special', OVA: 'OVA', ONA: 'ONA', MUSIC: 'Music' };

export function trailerFromAnilist(t) {
  if (!t?.id) return null;
  if (t.site === 'youtube') return `https://www.youtube-nocookie.com/embed/${t.id}?autoplay=1&rel=0`;
  if (t.site === 'dailymotion') return `https://www.dailymotion.com/embed/video/${t.id}?autoplay=1`;
  return null;
}

export function normalizeAnime(m) {
  if (!m) return null;
  return {
    key: `anime-${m.id}`,
    id: m.id,
    idMal: m.idMal || null,
    type: 'anime',
    title: m.title?.english || m.title?.romaji,
    year: String(m.seasonYear || m.startDate?.year || ''),
    rating: m.averageScore ? m.averageScore / 10 : null,
    poster: m.coverImage?.extraLarge || m.coverImage?.large || null,
    backdrop: m.bannerImage || null,
    overview: stripHtml(m.description || ''),
    genres: m.genres || [],
    format: FORMAT[m.format] || m.format || null,
    status: STATUS[m.status] || null,
    episodes: m.episodes || null,
    href: `/anime/${m.id}`,
  };
}

const page = (args, perPage = 20) =>
  `Page(perPage: ${perPage}) { media(type: ANIME, isAdult: false, ${args}) { ...F } }`;

export async function getAnimeCollections() {
  const now = Math.floor(Date.now() / 1000);
  const data = await anilist(`query {
    trending: ${page('sort: TRENDING_DESC')}
    popular: ${page('sort: POPULARITY_DESC')}
    top: ${page('sort: SCORE_DESC')}
    movies: ${page('format: MOVIE, sort: POPULARITY_DESC')}
    upcoming: ${page('status: NOT_YET_RELEASED, sort: POPULARITY_DESC')}
    latest: Page(perPage: 40) {
      airingSchedules(airingAt_lesser: ${now}, sort: TIME_DESC) {
        episode
        airingAt
        media { ...F isAdult countryOfOrigin }
      }
    }
  }`);
  const pick = (k) => (data?.[k]?.media || []).map(normalizeAnime).filter((a) => a?.poster);

  const seen = new Set();
  const latest = (data?.latest?.airingSchedules || [])
    .filter((s) => s.media && !s.media.isAdult && s.media.countryOfOrigin === 'JP')
    .filter((s) => (seen.has(s.media.id) ? false : seen.add(s.media.id)))
    .map((s) => ({ ...normalizeAnime(s.media), badge: `Ep ${s.episode}` }))
    .filter((a) => a.poster)
    .slice(0, 20);

  return {
    trending: pick('trending'),
    popular: pick('popular'),
    top: pick('top'),
    movies: pick('movies'),
    upcoming: pick('upcoming'),
    latest,
    trendingRaw: data?.trending?.media || [],
  };
}

export async function getAnimeByGenre(genre, pageNum = 1) {
  const data = await anilist(
    `query ($genre: String, $page: Int) {
      Page(page: $page, perPage: 30) {
        pageInfo { currentPage lastPage }
        media(type: ANIME, isAdult: false, genre: $genre, sort: POPULARITY_DESC) { ...F }
      }
    }`,
    { genre, page: Number(pageNum) || 1 }
  );
  return {
    items: (data?.Page?.media || []).map(normalizeAnime).filter((a) => a?.poster),
    page: data?.Page?.pageInfo?.currentPage || 1,
    totalPages: Math.min(data?.Page?.pageInfo?.lastPage || 1, 50),
  };
}

// MyAnimeList score via the public Jikan API. Optional: returns null on any failure.
export async function getMalScore(idMal) {
  if (!idMal) return null;
  try {
    // Optional extra: never let a slow Jikan hold up the page.
    const res = await fetch(`https://api.jikan.moe/v4/anime/${idMal}`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.score || null;
  } catch {
    return null;
  }
}

// cache(): AniList is a POST (not deduped by fetch), so share one call per request.
export const getAnime = cache(async function getAnime(id) {
  const data = await anilist(
    `query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ...F
        duration
        source
        studios(isMain: true) { nodes { name } }
        nextAiringEpisode { episode airingAt }
        externalLinks { site url type icon color }
        streamingEpisodes { title thumbnail url site }
        characters(perPage: 16, sort: ROLE) {
          nodes { id name { full } image { medium } }
        }
        staff(perPage: 6, sort: RELEVANCE) {
          edges { role node { name { full } } }
        }
        recommendations(perPage: 16, sort: RATING_DESC) {
          nodes { mediaRecommendation { ...F } }
        }
      }
    }`,
    { id: Number(id) }
  );
  const m = data?.Media;
  if (!m) return null;
  const base = normalizeAnime(m);
  const mal = await getMalScore(m.idMal);

  const runtime =
    m.format === 'MOVIE'
      ? m.duration
        ? `${Math.floor(m.duration / 60) ? `${Math.floor(m.duration / 60)}h ` : ''}${m.duration % 60}m`
        : null
      : m.episodes
        ? `${m.episodes} episodes`
        : null;

  const facts = [];
  if (base.format) facts.push(['Format', base.format]);
  if (base.status) facts.push(['Status', base.status]);
  if (m.episodes) facts.push(['Episodes', String(m.episodes)]);
  if (m.duration && m.format !== 'MOVIE') facts.push(['Episode length', `${m.duration}m`]);
  if (m.season && m.seasonYear) facts.push(['Season', `${m.season[0]}${m.season.slice(1).toLowerCase()} ${m.seasonYear}`]);
  if (m.startDate?.year) {
    const d = new Date(Date.UTC(m.startDate.year, (m.startDate.month || 1) - 1, m.startDate.day || 1));
    facts.push(['Started', d.toLocaleDateString('en-US', { year: 'numeric', month: m.startDate.month ? 'short' : undefined, day: m.startDate.day ? 'numeric' : undefined, timeZone: 'UTC' })]);
  }
  if (m.source) facts.push(['Source', m.source.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())]);

  const studios = (m.studios?.nodes || []).map((s) => s.name);
  const staff = (m.staff?.edges || []).slice(0, 4).map((e) => `${e.node?.name?.full} (${e.role})`);

  return {
    ...base,
    tagline: '',
    runtime,
    malScore: mal,
    facts,
    crew: [
      studios.length && { label: 'Studio', names: studios },
      staff.length && { label: 'Staff', names: staff },
    ].filter(Boolean),
    nextEpisode: m.nextAiringEpisode
      ? { number: m.nextAiringEpisode.episode, airingAt: m.nextAiringEpisode.airingAt }
      : null,
    streamingLinks: (m.externalLinks || [])
      .filter((l) => l.type === 'STREAMING' && l.url)
      .map((l) => ({ name: l.site, url: l.url, icon: l.icon, color: l.color })),
    officialEpisodes: (m.streamingEpisodes || []).map((e) => ({
      title: e.title,
      thumbnail: e.thumbnail,
      url: e.url,
      site: e.site,
    })),
    trailerUrl: trailerFromAnilist(m.trailer),
    cast: (m.characters?.nodes || []).map((c) => ({
      id: c.id,
      name: c.name?.full,
      role: '',
      photo: c.image?.medium || null,
    })),
    similar: (m.recommendations?.nodes || [])
      .map((n) => normalizeAnime(n.mediaRecommendation))
      .filter((a) => a?.poster),
  };
});

export async function getAnimeRecommendations(id) {
  const data = await anilist(
    `query ($id: Int) { Media(id: $id, type: ANIME) {
      recommendations(perPage: 12, sort: RATING_DESC) { nodes { mediaRecommendation { ...F } } }
    } }`,
    { id: Number(id) }
  );
  return (data?.Media?.recommendations?.nodes || [])
    .map((n) => normalizeAnime(n.mediaRecommendation))
    .filter((a) => a?.poster);
}

export async function searchAnime(q, perPage = 20) {
  const data = await anilist(
    `query ($q: String) { ${page('search: $q, sort: SEARCH_MATCH', perPage)} }`,
    { q },
    600
  );
  return (data?.Page?.media || []).map(normalizeAnime).filter((a) => a?.poster);
}
