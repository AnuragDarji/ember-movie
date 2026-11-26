import { NextResponse } from 'next/server';
import { getSeason } from '@/lib/tmdb';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));
  const s = Number(searchParams.get('s'));
  if (!id || !Number.isInteger(s) || s < 0) {
    return NextResponse.json({ error: 'Pass a show id and a season number.' }, { status: 400 });
  }
  const season = await getSeason(id, s);
  if (!season) return NextResponse.json({ error: 'That season could not be loaded.' }, { status: 404 });
  return NextResponse.json(season, { headers: { 'Cache-Control': 'public, s-maxage=3600' } });
}
