import PageHeader from '@/components/PageHeader';
import Row from '@/components/Row';
import SetupNotice from '@/components/SetupNotice';
import { getAnimeCollections } from '@/lib/anilist';
import { hasTmdbKey, tmdbList } from '@/lib/tmdb';

export const revalidate = 3600;
export const metadata = { title: 'Popular — Ember' };

export default async function Popular() {
  const [movies, tv, anime] = await Promise.all([
    tmdbList('/movie/popular', {}, 'movie'),
    tmdbList('/tv/popular', {}, 'tv'),
    getAnimeCollections(),
  ]);
  return (
    <div className="rows rows--top">
      <PageHeader title="Popular">The titles with the biggest audiences right now.</PageHeader>
      {!hasTmdbKey() && <SetupNotice />}
      <Row title="Popular Movies" items={movies} more="/movies" />
      <Row title="Popular TV Shows" items={tv} more="/tv" />
      <Row title="Popular Anime" items={anime.popular} more="/anime" />
    </div>
  );
}
