import { NextResponse } from 'next/server';
import { discover } from '@/lib/tmdb';

// Powers the "load more" button on /movies and /tv.
export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const type = sp.get('type');
  if (type !== 'movie' && type !== 'tv') return NextResponse.json({ items: [], page: 1, totalPages: 1 }, { status: 400 });
  const f = Object.fromEntries(['genre', 'year', 'lang', 'rating', 'sort', 'page', 'ott', 'region'].map((k) => [k, sp.get(k) || '']));
  const data = await discover(type, f);
  return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } });
}
