import TmdbBrowse, { FeaturedRow } from '@/components/browse/TmdbBrowse';
import { tmdbList } from '@/lib/tmdb';

export const metadata = { title: 'TV Shows — Ember' };

export default async function TV({ searchParams }) {
  const trending = tmdbList('/trending/tv/week', {}, 'tv'); // not awaited: streams in
  const top = tmdbList('/tv/top_rated', {}, 'tv');
  return (
    <TmdbBrowse
      type="tv"
      title="TV Shows"
      intro="Every series with seasons and episode guides. Filter to narrow it down."
      featured={<><FeaturedRow title="Trending This Week" items={trending} /><FeaturedRow title="Top Rated Shows" items={top} /></>}
      searchParams={searchParams}
    />
  );
}
