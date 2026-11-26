// Where-to-watch service. This is the one place that decides how "Watch Now" works,
// so components never build provider URLs themselves.
//
// Movies & TV: TMDB's watch-provider data (powered by JustWatch), per country.
// Anime: the official streaming links AniList lists (Crunchyroll, Netflix, HIDIVE…).
import { IMG } from './tmdb';

export const DEFAULT_REGION = (process.env.WATCH_REGION || 'US').toUpperCase();

const GROUPS = [
  ['flatrate', 'Stream'],
  ['free', 'Free'],
  ['ads', 'Free with ads'],
  ['rent', 'Rent'],
  ['buy', 'Buy'],
];

export function watchOptionsForTmdb(providers, region = DEFAULT_REGION) {
  const r = providers?.[region];
  if (!r) return { region, link: null, groups: [], source: 'justwatch' };
  const groups = GROUPS.map(([key, label]) => ({
    label,
    items: (r[key] || []).map((p) => ({
      id: p.provider_id,
      name: p.provider_name,
      logo: p.logo_path ? `${IMG}/w92${p.logo_path}` : null,
      url: r.link,
    })),
  })).filter((g) => g.items.length);
  return { region, link: r.link || null, groups, source: 'justwatch' };
}

export function watchOptionsForAnime(links = []) {
  const items = links.map((l) => ({ id: l.url, name: l.name, logo: l.icon || null, color: l.color, url: l.url }));
  return { region: null, link: null, groups: items.length ? [{ label: 'Stream', items }] : [], source: 'anilist' };
}

export function watchOptions(d) {
  return d.type === 'anime' ? watchOptionsForAnime(d.streamingLinks) : watchOptionsForTmdb(d.providers);
}
