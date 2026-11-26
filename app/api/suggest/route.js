import { NextResponse } from 'next/server';
import { searchAnime } from '@/lib/anilist';
import { searchTmdb } from '@/lib/tmdb';

const TYPE = { movie: 'Movie', tv: 'TV', anime: 'Anime' };

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().slice(0, 80);
  const type = searchParams.get('type') || 'all';
  if (q.length < 2) return NextResponse.json({ results: [] });

  const [titles, anime] = await Promise.all([
    type === 'anime' ? [] : searchTmdb(q),
    type === 'movie' || type === 'tv' ? [] : searchAnime(q, 6),
  ]);
  const filtered = type === 'movie' || type === 'tv' ? titles.filter((t) => t.type === type) : titles;

  // Interleave so both sources show up near the top.
  const merged = [];
  for (let i = 0; merged.length < 8 && (i < filtered.length || i < anime.length); i++) {
    if (filtered[i]) merged.push(filtered[i]);
    if (anime[i] && merged.length < 8) merged.push(anime[i]);
  }
  return NextResponse.json(
    {
      results: merged.map((r) => ({
        key: r.key,
        title: r.title,
        year: r.year,
        type: TYPE[r.type],
        rating: r.rating,
        poster: r.poster?.replace('/w342/', '/w92/'),
        href: r.href,
      })),
    },
    { headers: { 'Cache-Control': 'public, s-maxage=600' } }
  );
}
