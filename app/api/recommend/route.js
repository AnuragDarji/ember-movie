import { NextResponse } from 'next/server';
import { getAnimeRecommendations } from '@/lib/anilist';
import { getRecommendations, tmdbList } from '@/lib/tmdb';

// ?seeds=movie:603,tv:1399,anime:21 → titles recommended from those seeds.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const seeds = (searchParams.get('seeds') || '')
    .split(',')
    .map((s) => s.split(':'))
    .filter(([t, id]) => ['movie', 'tv', 'anime'].includes(t) && /^\d+$/.test(id || ''))
    .slice(0, 4);

  if (!seeds.length) {
    const items = await tmdbList('/trending/all/day');
    return NextResponse.json({ personalized: false, items: items.slice(0, 20) });
  }

  const lists = await Promise.all(
    seeds.map(([t, id]) => (t === 'anime' ? getAnimeRecommendations(id) : getRecommendations(t, id)))
  );
  const exclude = new Set(seeds.map(([t, id]) => `${t}-${id}`));
  const seen = new Set();
  const items = [];
  // Round-robin across seeds so one title doesn't dominate.
  for (let i = 0; items.length < 24 && lists.some((l) => l[i]); i++) {
    for (const l of lists) {
      const it = l[i];
      if (it && !exclude.has(it.key) && !seen.has(it.key)) {
        seen.add(it.key);
        items.push(it);
      }
    }
  }
  return NextResponse.json({ personalized: true, items });
}
