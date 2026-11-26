import TmdbBrowse, { FeaturedRow } from '@/components/browse/TmdbBrowse';
import { tmdbList } from '@/lib/tmdb';

export const metadata = { title: 'Movies — Ember' };

export default async function Movies({ searchParams }) {
  const now = tmdbList('/movie/now_playing', {}, 'movie'); // not awaited: streams in
  return (
    <TmdbBrowse
      type="movie"
      title="Movies"
      intro="Filter by genre, year, language and rating, or sort to find something new."
      featured={<FeaturedRow title="In Theaters Now" items={now} />}
      searchParams={searchParams}
    />
  );
}
